const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours
  // checkID,
  // checkBody
} = tourController;

const { protect, restrictTo } = authController;

const router = express.Router();

// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router
  .route('/')
  .get(authController.protect, getAllTours) // first run the protect function and only if user's authenticated, run route handler
  .post(createTour);
// .post(checkBody, createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour); // only certain user roles can delete a tour

module.exports = router;
