const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// GLOBAL MIDDLEWARES
// for setting security HTTP headers
app.use(helmet());

// rate limiting middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP. Please try again in an hour!'
});

// affects routes that only start with /api
app.use('/api', limiter);

// morgan middleware for development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parsing middleware, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // body cannot be over 10 kb

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss()); // clean any user input from any malicious HTML code with JS into it

// middleware preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ] // allows duplication of these parameters
  })
); // clears up the query string in the URL

// serving static files middleware
app.use(express.static(`${__dirname}/public`));

// testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// mount routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// This middleware catches routes that are not handled by the tour and user routers
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
