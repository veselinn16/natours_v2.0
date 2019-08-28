const Tour = require('./../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// // parameter middleware
// exports.checkID = (req, res, next, val) => {
//   // if there's no such tour, return following response
//   if (+val > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// checkBody middleware
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing name or price!'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success'
    // requestedAt: req.reqTime,
    // results: tours.length,
    // data: {
    //   tours
    // }
  });
};

exports.getTour = (req, res) => {
  // finds tour with the specified id
  // const tour = tours.find(el => el.id === +req.params.id);
  // // return requested tour
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success'
    // data: {
    //   tour: newTour
    // }
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'succes',
    data: {
      tour: '<Updataed Tour>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'succes',
    data: null
  });
};
