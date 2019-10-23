const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // check if there is a tour id and get only the reviews for this specific tour
  let filter = {}; // filter object
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // allow nested routes - get the tour off the URL if it is not in the request object
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // from protect middleware

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
