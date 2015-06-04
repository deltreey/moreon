'use strict';

var _ = require('lodash');
var Interval = require('./interval.model');

// Get list of intervals
exports.index = function(req, res) {
  Interval.find(function (err, intervals) {
    if(err) { return handleError(res, err); }
    return res.json(200, intervals);
  });
};

// Get a single interval
exports.show = function(req, res) {
  Interval.findById(req.params.id, function (err, interval) {
    if(err) { return handleError(res, err); }
    if(!interval) { return res.send(404); }
    return res.json(interval);
  });
};

// Creates a new interval in the DB.
exports.create = function(req, res) {
  Interval.create(req.body, function(err, interval) {
    if(err) { return handleError(res, err); }
    return res.json(201, interval);
  });
};

// Updates an existing interval in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Interval.findById(req.params.id, function (err, interval) {
    if (err) { return handleError(res, err); }
    if(!interval) { return res.send(404); }
    var updated = _.merge(interval, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, interval);
    });
  });
};

// Deletes a interval from the DB.
exports.destroy = function(req, res) {
  Interval.findById(req.params.id, function (err, interval) {
    if(err) { return handleError(res, err); }
    if(!interval) { return res.send(404); }
    interval.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}