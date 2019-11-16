import { showAlert } from './alerts';
import axios from 'axios';

export const sendContactsEmail = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/contacts',
      data
    });

    // forces a reload from the server cache
    if (res.data.status === 'success') {
      showAlert(
        'success',
        "Message sent successfully! We'll be in touch immediately"
      );
      // programatically navigate to login screen after 1.5s
      setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error sending email! Try again!');
  }
};
