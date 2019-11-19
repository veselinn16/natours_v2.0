import axios from 'axios';
import { showAlert } from './alerts';
import { createNewPass } from './createNewPass';

export const forgotPassword = async (email, password, passwordConfirm) => {
  if (password !== passwordConfirm)
    return showAlert('error', 'Passwords are not the same!');

  try {
    // send request with email to forgotPassword route, which generates password reset token
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/forgotPassword`,
      data: {
        email
      }
    });

    if (res.data.status === 'success') {
      createNewPass(res.data.data.resetURL, password, passwordConfirm);
    }
  } catch (err) {
    showAlert(
      'error',
      'Error occurred while saving new password! Please try again later!'
    );
  }
};
