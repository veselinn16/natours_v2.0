const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// in this controller, we're not using the route() method, because all the requests that are going to be performed are GET requests

const { getOverview, getTour, getTourDetails } = viewsController;

router.get('/', getOverview);

router.get('/tour/:slug', getTour);

module.exports = router;
