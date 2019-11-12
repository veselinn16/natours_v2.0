# Natours - tour booking app

## The Idea

Natours is a fictional company, which provides guided tours around America. There is a variety of tours aimed at the wants of an array of clients - whether you enjoy exploring the beautiful mountains, shopping in the big cities or explore the seaside - natours has you covered.

## The Technical Part

This is a website that makes use of a database, which exposes a RESTful API that is accessed by dynamically-generated templates. This is still a **work in progress**. Currently, there are 4 main resources - _tours_, _users_, _reviews_ and _bookings_.

### Users

The user database functionality implements a security-first approach with encrypted passwords. The authentication framework is applied via **JSON Web Tokens**, sent to the browser via cookies. Users have specific roles, which dictate which parts of the websites they can access. Password resets are also possible via tokens sent to the user via emails.

### Tours

The tours have a specially-dedicated URL as per the REST requirements. There are numerours queries, which are available via the respective API endpoints such as:

- getting all tours
- getting a single tour
- filtering tours by price
- filtering tours by duration
- filtering tours by price, locaiton
- many more
  The creation of new tours is restricted to users, that have their roles set to _lead guide_ or _admin_. The tours have reviews, which can be created by normal users.

### Reviews

Reviews belong to the specific tours. Only users with no administrative rights can create reviews. Admins, lead-guides and guides cannot post reviews.

### Bookings

Bookings are created whenever a user has chosen a tour and has successfully completed the billing process. Each booking is then tied to the appropriate user and can be seen via the _My bookings_ tab on the user's dashboard.

## Technology Stack

This app is my first dive into the world of back-end web development, while allowing me to exploit my front-end skills that I used to craft the static version of the website some time ago.
The technologies I used are:

- Node.js
- Express
- MongoDB
- Mongoose
- JavaScript
- CSS
- HTML(Pug)

## The Specifics

The project makes use of a variety of 3rd-party libraries to be able to deliver parts of the functionalities:

- Babel - used for future-proofing the JS code
- Axios - used for consistent network requests across browsers
- Bcrypt - used for hashing user passwords
- Compression - Express middleware for compressing responses
- Cookie-parser - used for parsing the cookies from the request body
- CORS - used for Cross-origin Resource Sharing
- Dot Env - used for specifying the path to the .env file
- Helmet - midlleware for setting security HTTP headers
- HPP - Express middleware used for preventing parameter pollution
- JSONWebToken - used for user authentication
- Morgan - Express middleware for development debugging
- Multer - Express middleware used for uploading user images
- Nodemailer - used for development emails
- Sharp - used for processing uploaded user images
- Slugify - used for providing convenient resource IDs
- Stripe - used for the payment functionality
- Validator - used for validating strings in the models
- XSS-clean - used for protection against cross-side scripting attacks
- Parcel - used for bundling front-end code

## The Real Thing

You can see a live version of the website [here](https://natours-initial.herokuapp.com/).
