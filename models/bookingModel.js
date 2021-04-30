const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price!']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  // if a customer does not own a credit card and wants to pay cash in an office, an admin could use this field to track the payment
  paid: {
    type: Boolean,
    default: true
  }
});

// pre middleware for all queries
// populate the user and tour whenever a user queries
bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
