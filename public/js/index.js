// This is the entry file - we get data from UI and delegate to the JS modules
import '@babel/polyfill'; // for newer JS features
import { login, logout } from './login';
import { updateUserData } from './updateData';
import { displayMap } from './mapbox';

// DOM elements
const mapbox = document.getElementById('map');
const form = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logOutBtn = document.querySelector('.nav__el--logout');

// values

if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;

    updateUserData({ name, email }, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const passwordBtn = document.querySelector('. btn--save-pasword');
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    passwordBtn.textContent = 'Updating...';

    await updateUserData(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    // clear inputs
    passwordBtn.textContent = 'Save Password';
    passwordCurrent = document.getElementById('password-current').value = '';
    password = document.getElementById('password').value = '';
    passwordConfirm = document.getElementById('password-confirm').value = '';
    passwordConfirm = document.getElementById('password-confirm').value;
  });
