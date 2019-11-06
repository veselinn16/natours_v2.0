const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`, // user is sent here if success
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // user is sent here if fail
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // passed to session
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100, // expected in cents
        currency: 'usd',
        quantity: 1
      }
    ]
  });
  // send session to client
  res.status(200).json({
    status: 'success',
    session
  });
});

// middleware for creating a booking. called when the / route is hit
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // INSECURE SOLUTION. Everyone knowing the route can create a booking without paying!
  const { user, tour, price } = req.query; // obtain data from query

  // if one of these is not defined, go to next middleware
  if (!user || !tour || !price) return next();

  // create booking
  await Booking.create({ tour, user, price });

  // redirect creates a new request to the passed in url
  res.redirect(req.originalUrl.split('?')[0]); // remove query string from url for security purposes
});
