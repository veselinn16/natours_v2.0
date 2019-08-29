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
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Missing name or price!'
//     });
//   }
//   next();
// };

// for the top-5-cheap route on the /tours route
exports.aliasTopTours = async (req, res, next) => {
  // prefills parts of the request object
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // 1a) basic filtering
    // shallow copy of query object
    const queryObj = { ...req.query };

    // fields that can be present in the URL, but we will only use for other purposes like pagination(for "page")
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // delete fields that should not be in the DB query
    excludedFields.forEach(field => delete queryObj[field]);

    // 1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj);

    // replaces the gt, gte, lte, lt with $gt, $gte, $lte, $lt, so mongoose can perform filtering
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      matchedStr => `$${matchedStr}`
    );

    let query = Tour.find(JSON.parse(queryStr));

    // 2) sorting
    if (req.query.sort) {
      // get individual sort criteria
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // order them by date created
      query = query.sort('-craetedAt');
    }

    // 3) field limiting for bandwith improvement
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) pagination
    // 1-10: page1, 11-20: page2, etc.
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numOfTours = await Tour.countDocuments();
      if (numOfTours <= skip) throw new Error('This page does not exist!');
    }

    // execute query
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // shorthand for Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }

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

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'succes',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'succes',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
