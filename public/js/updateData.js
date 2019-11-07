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

    if (res.data.status === 'success')
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
