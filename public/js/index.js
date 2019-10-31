// This is the entry file - we get data from UI and delegate to the JS modules
import '@babel/polyfill'; // for newer JS features
import { login } from './login';
import { displayMap } from './mapbox';

// DOM elements
const mapbox = document.getElementById('map');
const form = document.querySelector('.form');

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
