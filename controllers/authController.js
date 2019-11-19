const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = (user, statusCode, req, res) => {
  // sign JWT
  const token = signToken(user._id);

  let secure = null;

  secure = req.secure;
  // process.env.NODE_ENV === 'development'
  // ? false
  // : req.secure || req.headers.xForwardedProto === 'https';
  // : req.secure || req.headers('x-forwarded-proto') === 'https';

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), // converting 90 to ms
    // secure: true, // only on https connections
    httpOnly: true, // cannot be accessed or modified in any way by the browser
    // set only on production // req.headers('x-forwarded-proto') === 'https' is Heroku-specific!
    // secure: req.secure || req.headers('x-forwarded-proto') === 'https'
    secure
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // remove password from response object only

  // sends user and JWT to the client
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  // creates new user that is not an admin. To create admins, go to Compass and edit role
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`; // `http://localhost:8000/me`

  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, req, res);
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

  createAndSendToken(user, 200, req, res);
});

// logout user by overwriting the jwt cookie with a fake one, which expires in 10s
exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // if authorization header exists and contains a token, extract token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // if there's not authorization header, look for JWT in the request object
    token = req.cookies.jwt;
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
  req.user = currentUser; // puts user onto the request object in order to make it available to the next middleware
  res.locals.user = currentUser; // put user on locals object so we can access it in pug template
  next();
});

// this middleware is only for the rendered pages that need to know if there is a logged in user or not
// there should never be an error
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // verify token
      const decodedPayload = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // check if user still exists. Attackers could have stolen JWT
      const currentUser = await User.findById(decodedPayload.id);
      if (!currentUser) return next();

      //check if user has changed password after token was issued
      if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
        return next();
      }

      // there is a logged in user
      // we put the user on the locals object, which is accessible to all Pug templates
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  // in case there is no cookie, call the next middleware
  next();
};

exports.restrictTo = (...roles) => {
  // roles is an array of roles strings
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // user is put into the request object in the upper middleware which runs before this, so here we'll have access to the user on the request object
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with this email!', 404));

  // generate random token, which is not encrypted
  const resetToken = user.createPasswordResetToken();

  // deactivates all validators defined on the schema, because all the fields marked with required are not entered
  await user.save({ validateBeforeSave: false });

  try {
    // send token in an email to user
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendResetPassword();

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Reset URL sent to email!',
        resetURL
      }
    });
  } catch (err) {
    console.log(err);
    // reset token and token expiration of document
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on reset token
  // hash token we get from URL parameter
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // gets user that has this token AND has valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // set new password if user exists and reset token has not expired
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // remove fields for reset token
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // send email notifying user
  const url = `${req.protocol}://${req.get('host')}/`;
  await new Email(user, url).sendModifiedPassword();

  createAndSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  const user = await User.findById(req.user.id).select('+password'); // findByIdAndUpdate() would not activate the middlewares and validators

  // check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Password is incorrect', 401));

  // if password is correct, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // url for the buttons in the email
  const url = `${req.protocol}://${req.get('host')}/`;

  // send email notifying user of modified password
  await new Email(user, url).sendModifiedPassword();

  // createAndSendToken(user, 200, req, res);

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
});

exports.sendContactsMessage = catchAsync(async (req, res, next) => {
  const { email, subject, name, message } = req.body;

  const user = {
    name,
    email
  };

  const url = `${req.protocol}://${req.get('host')}/`;
  await new Email(user, url, `${name} <${email}>`).sendContactsMessage(
    subject,
    message,
    user
  );

  res.status(200).json({
    status: 'success',
    message: 'Your message has been sent!'
  });
});
