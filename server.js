const mongoose = require('mongoose');
const dotenv = require('dotenv');

// safety net for unhandled errors
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
console.log(process.env.DATABASE);

// connection uri
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
    // useUnifiedTopology: true
  })
  .then(() => console.log('DB connection is successful'));

// INIT SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Running in ${process.env.NODE_ENV} mode`);
  console.log(`App running on port ${port}`);
});

// safety net for unhandled promises
process.on('unhandledRejection', err => {
  // console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  // console.log(err.name, err.message);
  console.log(err);

  // gracefully shut down the server and then the app
  server.close(() => {
    // 1 is a status code - unhandled exception; 0 is for success
    process.exit(1);
  });
});
