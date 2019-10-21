const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  // check if the fields of the passed in object are allowed and if they are get them and put them and their values in the new object
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  // We're not sending a 404 error because a result of 0 users is still a correct result
  // Sends response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet implemented'
  });
};

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
