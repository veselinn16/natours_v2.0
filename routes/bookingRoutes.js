const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const {
  getCheckoutSession,
  createBooking,
  getAllBookings,
  getBooking,
  deleteBooking,
  updateBooking
} = bookingController;

const { protect, restrictTo } = authController;

const router = express.Router();

// only to logged in users
router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(getAllBookings)
  .post(createBooking);

router
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = router;
