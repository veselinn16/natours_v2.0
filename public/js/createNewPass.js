import axios from 'axios';
import { showAlert } from './alerts';

export const createNewPass = async (url, password, passwordConfirm) => {
  try {
    // send request with new password to resetPassword route, which sets new password
    const res = await axios({
      method: 'PATCH',
      url,
      data: {
        password,
        passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Success! Your new password has been set!');

      setTimeout(() => {
        window.location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert(
      'error',
      'Error occurred while saving new password! Please try again later!'
    );
  }
};
