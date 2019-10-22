const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const { getAllReviews, createReview } = reviewController;
const { protect, restrictTo } = authController;

// we'll mount this on /api/reviews
const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
