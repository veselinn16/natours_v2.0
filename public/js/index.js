// This is the entry file - we get data from UI and delegate to the JS modules
import '@babel/polyfill'; // for newer JS features
import { login, logout } from './login';
import { signup } from './signup';
import { sendContactsEmail } from './contact';
import { updateUserData } from './updateData';
import { forgotPassword } from './forgotPassword';
import { submitReview } from './submitReview';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM elements
const mapbox = document.getElementById('map');
const form = document.querySelector('.form--login');
// billing
const formBilling = document.querySelector('.form--billing');
const cardNumber = document.getElementById('card');
const cardExpiration = document.getElementById('card-expiration');
const cardName = document.getElementById('card-name');

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logOutBtn = document.querySelector('.nav__el--logout');
const bookButton = document.getElementById('book-tour');
const signupBtn = document.querySelector('.btn--signup');
const contactsBtn = document.querySelector('.btn--contacts');
const accountSideNav = document.querySelector('.side-nav');
const forgotPasswordBtn = document.querySelector('.btn--forgot-password');

const showReviewBtn = document.querySelector('.btn--show-review');
const reviewStars = document.querySelector('.reviews__rating-review');
const reviewSubmitBtn = document.querySelector('.btn--submit-review');

if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (form && !signupBtn && !contactsBtn) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (signupBtn) {
  signupBtn.addEventListener('click', e => {
    e.preventDefault();

    // recreating multipart form data
    const form = new FormData();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const photo = document.getElementById('photo').files[0];

    if (!name || !email || !password || !passwordConfirm)
      return showAlert(
        'error',
        'Please fill out all the required information!'
      );

    form.append('name', name);
    form.append('email', email);
    form.append('password', password);
    form.append('passwordConfirm', passwordConfirm);

    if (photo) {
      form.append('photo', photo);
    }

    signup(form);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    // recreating multipart form data
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUserData(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const passwordBtn = document.querySelector('.btn--save-pasword');
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    passwordBtn.textContent = 'Updating...';

    await updateUserData(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
  });
}

if (bookButton) {
  bookButton.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    // const tourId = e.target.dataset.tourId
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) showAlert('success', alertMessage, 17);

// toggle the active class on side menu list items
if (accountSideNav) {
  accountSideNav.addEventListener('click', e => {
    const sideEls = Array.from(accountSideNav.children);

    sideEls.forEach(child => {
      child.classList.remove('side-nav--active');
    });

    e.target.parentElement.classList.add('side-nav--active');
  });
}

// billing form
if (formBilling) {
  formBilling.onsubmit = e => {
    e.preventDefault();

    const form = new FormData();
    form.append('card', cardNumber.value);
    form.append('cardExpiration', cardExpiration.value);
    form.append('cardName', cardName.value);

    // console.log({
    //   cardNumber: cardNumber.value,
    //   cardExpiration: cardExpiration.value,
    //   cardName: cardName.value
    // });
  };
}

if (cardNumber) {
  cardNumber.oninput = e => {
    switch (e.target.value.length) {
      case 4:
        e.target.value += ' ';
        break;
      case 9:
        e.target.value += ' ';
        break;
      case 14:
        e.target.value += ' ';
        break;
      default:
        return e.target.value;
    }
  };
}

if (cardExpiration) {
  cardExpiration.oninput = e => {
    if (e.target.value.length === 2) {
      e.target.value += '/';
    }
  };
}

if (contactsBtn) {
  contactsBtn.onclick = e => {
    e.preventDefault();
    const radios = document.querySelectorAll('.radio');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    let subject = `Client message: ${
      Array.from(radios).filter(radio => radio.checked)[0].value
    }`;

    sendContactsEmail({
      email,
      subject,
      name,
      message
    });
  };
}

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener('click', e => {
    e.preventDefault();

    const userEmail = document.getElementById('email').value;
    const password = document.getElementById('password-forgot').value;
    const passwordConfirm = document.getElementById('password-confirm-forgot')
      .value;

    forgotPassword(userEmail, password, passwordConfirm);
  });
}

const addListenerToSubmitReview = () => {
  reviewSubmitBtn.addEventListener('click', e => {
    e.preventDefault();
    const reviewText = document.querySelector('.review__form-text').value;
    const reviewRating = stars.filter(star =>
      star.classList.contains('reviews__star--active')
    );

    if (!reviewText || reviewRating.length === 0)
      return showAlert('error', 'Please provide a review and a rating!');

    submitReview(reviewText, reviewRating.length);
  });
};

if (showReviewBtn) {
  showReviewBtn.addEventListener('click', e => {
    e.preventDefault();
    addListenerToSubmitReview();

    const reviewForm = document.querySelector('.review__form');
    if (reviewForm.style.visibility !== 'visible') {
      // show review form and scroll to it
      reviewForm.style.visibility = 'visible';
      reviewForm.style.height = '40rem';
      reviewForm.style.margin = '2rem auto';
      reviewForm.style.padding = '7rem 0';

      window.scroll({
        top: document.body.scrollHeight * 0.72,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      // scroll to review form
      window.scroll({
        top: document.body.scrollHeight * 0.65,
        left: 0,
        behavior: 'smooth'
      });
    }
  });
}

const stars = Array.from(document.querySelectorAll('.reviews__star--big'));
if (reviewStars) {
  reviewStars.addEventListener('click', e => {
    const clicked = stars.indexOf(e.target);

    if (clicked >= 0) {
      stars.forEach((star, i) => {
        star.classList =
          i > clicked
            ? 'reviews__star--big reviews__star--inactive'
            : 'reviews__star--big reviews__star--active';
      });
    }
  });
}
