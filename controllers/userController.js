const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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
