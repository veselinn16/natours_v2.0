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
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8
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

const User = mongoose.model('User', userSchema);

module.exports = User;
