const Tour = require('./../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();

// checks whether the provided file is an image by looking at the file's mimetype
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only images!', 400), false);
  }
};

// multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// upload.array('images', 5); // only one field with multiple images
// multiple fields with images
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.imageCover || !req.files.images) return next();

  // put the file name on request body so factory function can update it
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // process cover images
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) // 2:3 aspect ratio
    .toFormat('jpeg') // convert to jpeg
    .jpeg({ quality: 90 }) // compress image to 90% quality
    .toFile(`public/img/tours/${req.body.imageCover}`); // saves to file on disk

  // we need this empty array, because of how the factory function updates the document - it takes whatever is inside of the req.body, so must put everything on req.body
  req.body.images = [];

  // process other images in a loop
  await Promise.all(
    // we're using Promise.all in order to have a way of awaitng the code inside the async function.
    // async does not work in a foreach loop!!!
    req.files.images.map(async (img, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(img.buffer)
        .resize(2000, 1333) // 2:3 aspect ratio
        .toFormat('jpeg') // convert to jpeg
        .jpeg({ quality: 90 }) // compress image to 90% quality
        .toFile(`public/img/tours/${filename}`); // saves to file on disk

      req.body.images.push(filename);
    })
  );

  // returns an object, on which we can call methods

  next();
});

// factory functions
const factory = require('./handlerFactory');

// for the top-5-cheap route on the /tours route
exports.aliasTopTours = (req, res, next) => {
  // prefills parts of the request object
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

// old version
// exports.getTour = catchAsync(async (req, res, next) => {
//   // search for tour and populate the guides references with actual users
//   const tour = await Tour.findById(req.params.id).populate('reviews'); // populate the reviews for the tour

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, {
  path: 'reviews'
});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'succes',
//     data: null
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // this is an array of stages the documents should pass through
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $num: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $num: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

// for Geospatial query
// /tours-within/233/center/34.2424,-118.42412/unit/mi - example URL
exports.getToursWithin = catchAsync(async (req, res, next) => {
  // destructure the parameters from url
  const { distance, latlng, unit } = req.params;

  // destructure lat and lng
  const [lat, lng] = latlng.split(',');

  // radius of earth in mies = 3963.2
  // radius of earth in km = 6378.1
  // distance has to be in radiant measure unit
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  // we define a 2D sphere using lng and lat(GeoJSON), through which we query with the $centerSphere query operator
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  // destructure the parameters from url
  const { latlng, unit } = req.params;

  // destructure lat and lng
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  // miles or km
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  // aggregagtion pipeline for geospatial data
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          // Geo JSON
          type: 'Point',
          coordinates: [+lng, +lat]
        },
        // this is the field where all calculated data will be put on
        distanceField: 'distance',
        // converts the meters that are returned to km
        distanceMultiplier: multiplier
      }
    },
    {
      // this stage selects only the wanted fields of the returned tours
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
