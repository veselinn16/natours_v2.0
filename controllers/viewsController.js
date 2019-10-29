const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
};
