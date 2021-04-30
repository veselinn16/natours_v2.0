const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'You must provide text to the review!']
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating!'],
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    createdAt: { type: Date, default: Date.now },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!']
    }
  },
  {
    // show virtual properties in output as well
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// compound index making sure that each combination of tour and user is unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE
// works for find(), findOne(), etc.
reviewSchema.pre(/^find/, function(next) {
  // populate the user and tour fields
  // this.populate({
  //   path: 'user',
  //   select: 'name photo' // only get the name and photo of the user
  // }).populate({
  //   path: 'tour',
  //   select: 'name' // only get the name of the tour
  // });

  // populate only the user field
  this.populate({
    path: 'user',
    select: 'name photo' // only get the name and photo of the user
  });

  next();
});

// static method for calculating average rating for a tour. Called whenever a new tour is created
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this points to the current model
  const stats = await this.aggregate([
    {
      // first stage
      $match: { tour: tourId }
    },
    {
      $group: {
        // group by tour
        _id: '$tour',
        nRating: { $sum: 1 }, // add 1 for each rating that a tour has
        avgRating: { $avg: '$rating' } // calc avg rating
      }
    }
  ]);

  // console.log(stats); // returns array

  if (stats.length > 0) {
    // persists stats to db
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 4.5,
      ratingsAverage: 0
    });
  }
};

reviewSchema.post('save', function() {
  // no next because this is a post middleware
  // this points to the current review
  // Review.calcAverageRatings(this.tour) // since Review is not yet defined, we can't call it like this

  // this constructor points to the model as well
  this.constructor.calcAverageRatings(this.tour);
});

// this middleware will get the document by using the query's findOne() method to return it
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // we get the review and set it to the r field in the document in order to have access to it in the below post middleware, because there, the query is executed and we can't use this trick
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // this.r here is the review document, which has the tour id on its tour field
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
