import { showAlert } from './alerts';
import axios from 'axios';

export const signup = async userInfo => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup', // for production
      data: userInfo
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Welcome to the Natours family!');
      // programatically navigate to login screen after 1.5s
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // construct error message
    let msg = '';

    // native message is janky, so specially define one if there is a user with the same email
    if (err.response.data.message.includes('key'))
      msg = 'A user with this email already exists!';

    // if the error is not for duplicate users, set error to the native one
    !msg && (msg = err.response.data.message);
    showAlert('error', msg);
  }
};
