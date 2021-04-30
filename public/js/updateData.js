import axios from 'axios';
import { showAlert } from './alerts';

// type is either password or data
// data is an object
export const updateUserData = async (data, type) => {
  try {
    const url = type === 'password' ? 'updateMyPassword' : 'updateMe';
    const res = await axios({
      method: 'PATCH',
      // url: `http://localhost:8000/api/v1/users/${url}`, // for development
      url: `/api/v1/users/${url}`, // for production
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      if (type === 'password') {
        document.querySelector('.btn--save-pasword').textContent = 'Done';
      }

      setTimeout(() => {
        // reset page
        window.location.assign('/login');
      }, 1500);
    }
  } catch (err) {
    if (type === 'password') {
      document.querySelector('.btn--save-pasword').textContent =
        'Save password';
    }
    showAlert('error', err.response.data.message);
  }
};
