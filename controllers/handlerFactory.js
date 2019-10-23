// FACTORY FUNCTIONS FOR ROUTE HANDLERS
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'succes',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'succes',
      data: {
        data: document
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDocument
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // create the query
    let query = Model.findById(req.params.id);

    // if there is a populate options passed, populate the referenced fields
    if (populateOptions) query = query.populate(populateOptions);

    // execute query
    const document = await query;

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // this is only needed for nested revies on tour - hack
    // check if there is a tour id and get only the reviews for this specific tour
    let filter = {}; // filter object
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const documents = await features.query;

    // We're not sending a 404 error because a result of 0 documents is still a correct result
    // Sends response
    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        data: documents
      }
    });
  });
