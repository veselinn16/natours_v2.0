const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email, photo, password, passworConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name!']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!']
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  photo: { type: String, default: 'default.jpg' },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    // doesn't return the password to the client
    select: false
  },
  passwordConfirm: {
    // only needed for validating user input, not persisted in DB, check pre-save middleware
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // this only works on CREATEing a user and SAVE or saving a user, e.g updating!!!
      validator: function(el) {
        // checks whether both password fields match
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// pre-save mongoose middleware for password encryption
userSchema.pre('save', async function(next) {
  // if password has not been modified, do nothing
  if (!this.isModified('password')) return next();

  // 12 is how CPU-intensive the encryption process should be, leading to better encryption
  this.password = await bcrypt.hash(this.password, 12);

  // do not persist this field on the DB
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function(next) {
  // if we didn't modify the password property OR if this is a new document, call next middleware
  if (!this.isModified('password') || this.isNew) return next();

  // enables us to log the user in, because saving to the db is a bit slower than the issuing of the new passwordChangedAt timestamp
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// query middleware for filtering out inactive users
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } }); // not equal to false

  next();
});

// instance method comparing the password for login provided by user is valid to that of the db
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // compares sent password by user to user's password stored in db
  return await bcrypt.compare(candidatePassword, userPassword);
};

// instance method checking whether user's trying to access resource after he's modified his password
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // this points to the current document
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp; // 100 < 200 -> true(password is changed after token issue)
  }

  // password has not been changed
  return false;
};

// instance method for password reset token generation
userSchema.methods.createPasswordResetToken = function() {
  // generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // encrypt token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  // expires after 10 mins
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // we're only modifying the document in the db here. We're saving the document to the db in authController.forgotPassword
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
