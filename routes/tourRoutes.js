const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const {
  getAllTours,
  createTour,
  getTour,
  getTourStats,
  updateTour,
  deleteTour,
  aliasTopTours,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
  // checkID,
  // checkBody
} = tourController;

const { protect, restrictTo } = authController;

const router = express.Router();

// router.param('id', checkID);

// POST /tour/fiow123d/reviews
// GET /tour/fiow123d/reviews
// GET /tour/fiow123d/reviews/f1dw123
// use the review router for this specific route
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

// Geospatial query for tours within some distance of coords
// latlng - coordinates
// distance - distance of coordinates
// unit - unit of measurement
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
// .post(checkBody, createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour); // only certain user roles can delete a tour

module.exports = router;
