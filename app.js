const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const bookingController = require('./controllers/bookingController');

// start express app
const app = express();

// make app trust proxies to enable to check whether connection is secure(HTTPS) - enable setting of the x-forward-proto header on the request
app.enable('trust proxy');

// explain that we're going to use Pug for the templating language
app.set('view engine', 'pug');
// the path to the views
app.set('views', path.join(__dirname, 'views'));

// implement CORS
app.use(cors());

// handles all OPTIONS requests for all routes and sends back a Access-Control-Allow-Origin header, allowing CORS
app.options('*', cors());

// serving static files middleware, which will set the root directory to public
app.use(express.static(path.join(__dirname, 'public')));

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

// Stripe webhook route
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webHookCheckout
);

// morgan middleware for development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parsing middleware, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // body cannot be over 10 kb

// parse data coming from a url-encoded form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// cookie parser middleware for reading cookies
app.use(cookieParser());

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

// compresses the text we send as a response
app.use(compression());

// testing middleware, which logs query time and cookies coming from request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// mount routers // essentially, the route handlers are middlewares mounted on the routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// This middleware catches routes that are not handled by any route handlers
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
