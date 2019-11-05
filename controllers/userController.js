const multer = require('multer');
const sharp = require('sharp');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// we define where the photo should be created
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // sets the destination for the file on disk
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-eif31241mdo3d3o1i4-timestamp.jpeg
//     // file points to req.file
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   }
// });

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

// middleware for configuring user photos
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // needed in other middleware
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // returns an object, on which we can call methods
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg') // convert to jpeg
    .jpeg({ quality: 90 }) // compress image to 90% quality
    .toFile(`public/img/users/${req.file.filename}`); // saves to file on disk

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  // check if the fields of the passed in object are allowed and if they are, get them and put them and their values in the new object
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not defined! Please use /signUp instead!'
  });
};

// this middleware runs before calling the getOne factory function
exports.getMe = (req, res, next) => {
  // puts the user id on the request object. user comes from protect
  req.params.id = req.user.id;

  next();
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// we should NOT update passwords with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  // create error if user posts password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates! Please use /updateMyPassword.',
        400
      )
    );

  // we cannot allow the user to reset some fields like role and tokens. Only email and name should be changed
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; // if there's a photo on the request, add the file to the photo property to the document that's about to be updated

  // update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
