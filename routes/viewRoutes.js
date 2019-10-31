const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// in this controller, we're not using the route() method, because all the requests that are going to be performed are GET requests

const { getOverview, getTour, getLoginForm } = viewsController;
const { isLoggedIn } = authController;

// all routes use this middleware to have access to the user in the pug templates
router.use(isLoggedIn);

router.get('/', getOverview);

router.get('/tour/:slug', getTour);

router.get('/login', getLoginForm);

module.exports = router;
