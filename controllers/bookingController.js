const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`, // user is sent here if success
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // user is sent here if fail
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // passed to session
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
        ],
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
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // INSECURE SOLUTION. Everyone knowing the route can create a booking without paying!
//   const { user, tour, price } = req.query; // obtain data from query

//   // if one of these is not defined, go to next middleware
//   if (!user || !tour || !price) return next();

//   // create booking
//   await Booking.create({ tour, user, price });

//   // redirect creates a new request to the passed in url
//   res.redirect(req.originalUrl.split('?')[0]); // remove query string from url for security purposes
// });

const createBookingCheckout = catchAsync(async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100; // get dollars
  await Booking.create({ tour, user, price });
});

exports.webHookCheckout = (req, res, next) => {
  // called whenever a payment is successful
  // read signature
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    // construct stripe event
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({
    received: true
  });
};

exports.createBooking = factory.createOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
