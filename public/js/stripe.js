import axios from 'axios';
import { showAlert } from './alerts';

// public key
const stripe = Stripe('pk_test_0E7cOO7wDH9X5mAX4b9bQBdB00WxOdpQSF');

// tourId comes from the front-end button's data-tour-id attribute
export const bookTour = async tourId => {
  try {
    // get session from server from natours API
    const session = await axios(
      // `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}` // for development
      `/api/v1/bookings/checkout-session/${tourId}` // for production
    );

    // create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
