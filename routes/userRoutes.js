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
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto
} = userController;

const {
  signUp,
  logIn,
  logOut,
  resetPassword,
  forgotPassword,
  protect,
  restrictTo,
  updatePassword,
  sendContactsMessage
} = authController;

const router = express.Router();

// routes can be accessed by anyone
router.post('/signup', uploadUserPhoto, resizeUserPhoto, signUp);
router.post('/login', logIn);
router.get('/logout', logOut);
router.post('/contacts', sendContactsMessage);

router.post('/forgotPassword', protect, forgotPassword);
router.patch('/resetPassword/:token', protect, resetPassword);

// Protect all the routes that are matched after this point - user must be authenticated
router.use(protect);

// router.patch('/updateMyPassword', protect, updatePassword); // old version before adding protect middleware
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.route('/me').get(getMe, getUser);

// only admins can access following routes
router.use(restrictTo('admin'));

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
