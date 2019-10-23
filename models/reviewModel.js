const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
