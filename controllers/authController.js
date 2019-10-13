const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signUp = catchAsync(async (req, res, next) => {
  // creates new user
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});
