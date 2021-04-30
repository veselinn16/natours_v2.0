const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Reviews = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

// give access to alerts in all templates
exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking') {
    res.locals.alert =
      'Your booking was successful. Please check your email for confirmation. If your booking does not show up immediately, please check later!';
  }

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // get tour data from tours collection in DB
  const tours = await Tour.find(); // all tours

  // build template

  // render template using tour data

  res.status(200).render('overview', {
    title: 'All Tours',
    tours // put the tours so we can use them in the template
  });
});

// exports.getOverview = (req, res) => {
//   res.status(200).render('overview', {
//     tour: 'The Forest Hiker',
//     user: 'Veselin Tonev'
//   });
// };

exports.getTour = catchAsync(async (req, res, next) => {
  // get data for requested tour (including reviews and tour guides)

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
    populate: {
      path: 'user'
    }
  });

  let reviewByUser = false;
  if (req.user) {
    tour.reviews.forEach(review => {
      if (review.user.id === req.user.id) {
        reviewByUser = review;
      }
    });
  }
  // load latest revies first
  const reviewsClone = tour.reviews.reverse();
  if (reviewByUser) {
    const i = reviewsClone.indexOf(reviewByUser);
    reviewsClone.splice(i, 1);
    reviewsClone.unshift(reviewByUser);
  }
  // now we build the template - in pug

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // render template using data from DB
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    reviews: reviewsClone,
    reviewByUser
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account'
  });
};

exports.getBillingForm = (req, res) => {
  res.status(200).render('billing', {
    title: 'My Billing Information'
  });
};

exports.getAbout = async (req, res) => {
  res.status(200).render('about', {
    title: 'About Us',
    user: req.user // coming from isLoggedIn middleware
  });
};

exports.getContacts = (req, res) => {
  res.status(200).render('contacts', {
    title: 'Contact Us',
    user: req.user // coming from isLoggedIn middleware
  });
};

exports.getCareers = (req, res) => {
  res.status(200).render('careers', {
    title: 'Careers at Natours',
    user: req.user
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getForgotPassword = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Password'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // find all bookings // could be done with virtual populate
  const bookings = await Booking.find({ user: req.user.id });

  // find tours with the returned ids
  const tourIDs = bookings.map(booking => booking.tour);

  // selects all the tours, which have an id whichi is in the tourIDs array
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Reviews.find({ user: req.user.id }).populate(
    'tour',
    'name imageCover slug'
  );
  console.log(reviews[0]);

  res.status(200).render('reviews', {
    title: 'My reviews',
    reviews
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { email, name },
    {
      new: true, // get the new user
      runValidators: true // run validators on input data
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
