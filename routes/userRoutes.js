const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe
} = userController;

const {
  signUp,
  logIn,
  resetPassword,
  forgotPassword,
  protect,
  updatePassword
} = authController;

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', logIn);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/me').get(protect, getMe, getUser);

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
