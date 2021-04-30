const Review = require('./../models/reviewModel');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// middleware which runs befor the createReview
exports.setTourAndUserId = catchAsync(async (req, res, next) => {
  let tour;
  if (!req.params.tourId) {
    tour = await Tour.findOne({ slug: req.body.slug });
  }

  // allow nested routes - get the tour off the URL if it is not in the request object
  if (!req.body.tour) req.body.tour = req.params.tourId || tour.id;
  if (!req.body.user) req.body.user = req.user.id; // from protect middleware

  next();
});

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);
