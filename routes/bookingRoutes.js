const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const { getCheckoutSession } = bookingController;

const { protect, restrictTo } = authController;

const router = express.Router();

router.get('/checkout-session/:tourId', protect, getCheckoutSession);

module.exports = router;
