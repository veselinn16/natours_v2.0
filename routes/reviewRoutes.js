const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const {
  getAllReviews,
  getReview,
  createReview,
  deleteReview,
  updateReview,
  setTourAndUserId
} = reviewController;
const { protect, restrictTo } = authController;

// we'll mount this on /api/reviews
const router = express.Router({ mergeParams: true }); // mergeParams is used to get the tourId param coming from the tour router

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourAndUserId, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
