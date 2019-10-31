const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
    fields: 'review rating user'
  });

  // now we need to build the template - in pug

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // render template using data from DB
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};
