const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    // requestedAt: req.reqTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  // finds tour with the specified id
  const tour = tours.find(el => el.id === +req.params.id);

  // if there's no such tour, return following response
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // return requested tour
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);
  // figure out id of new tour
  const newId = tours[tours.length - 1].id - 1;

  // create a response object holding the new tour by:
  // merging the id of new tour with the data received from the client
  const newTour = Object.assign({ id: newId }, req.body);

  // push the new tour in the array of tours to create the whole list of tours
  tours.push(newTour);

  // replace the old data in the file with the tours with the newly-created data
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    status: 'succes',
    data: {
      tour: '<Updataed Tour>'
    }
  });
};

exports.deleteTour = (req, res) => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(204).json({
    status: 'succes',
    data: null
  });
};
