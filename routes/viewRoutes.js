const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// in this controller, we're not using the route() method, because all the requests that are going to be performed are GET requests

const {
  getOverview,
  getTour,
  getMyTours,
  getLoginForm,
  getAccount,
  updateUserData
} = viewsController;
const { isLoggedIn, protect } = authController;

// all routes use this middleware to have access to the user in the pug templates
// router.use(isLoggedIn); // we can't use it here, because there will be duplicate queries done in the protect middleware, which runs before the getAccount handler

router.get('/', isLoggedIn, getOverview);

router.get('/tour/:slug', isLoggedIn, getTour);

router.get('/login', isLoggedIn, getLoginForm);

router.get('/me', protect, getAccount);
router.get(
  '/my-tours',
  // bookingController.createBookingCheckout,
  protect,
  getMyTours
);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
