const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  // creates new user that is not an admin. To create admins, go to Compass and edit role
  console.log(req);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  // sign JWT
  const token = signToken(newUser._id);

  // sends user and JWT to the client
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // check if user exists and password exists. The password is, by default, not available in the response, but we get it from the db by explicitly selecting it with a + in front of the field
  // user is now a document, which has access to the instance methdods we've previously defined
  const user = await User.findOne({ email }).select('+password');

  // validate password
  // const correct = await user.correctPassword(password, user.password);

  // if there's no user or passwords do not match
  // if (!user || !correct) {
  if (!user || !(await user.correctPassword(password, user.password))) {
    // intentionally vague, in order not to give potential attackers info
    return next(new AppError('Incorrect email or password!', 401));
  }

  // send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // if authorization header exists and contains a token, extract token
    token = req.headers.authorization.split(' ')[1];
  }

  // verify token
  if (!token) {
    // 401 - not authorized
    return next(new AppError('Please log in to get access!', 401));
  }
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // check if user still exists. Attackers could have stolen JWT
  const currentUser = await User.findById(decodedPayload.id);
  if (!currentUser)
    return next(
      new AppError('The token belongs to a user, which does not exist!', 401)
    );

  //check if user has changed password after token was issued
  if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
    return next(
      new AppError('User recently changed password! Please login again!', 401)
    );
  }

  // grant access to protected route if all steps are successful
  req.user = currentUser;
  next();
});
