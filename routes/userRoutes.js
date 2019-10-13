const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const {
  getAllusers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = userController;

const { signUp } = authController;

const router = express.Router();

router.post('/signup', signUp);

router
  .route('/')
  .get(getAllusers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
