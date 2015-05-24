'use strict';

var _ = require('lodash');
var Ram = require('./ram.model');
var SSH = require('simple-ssh');

function getDiskUsage(server, user) {
  var ssh = new SSH({
    host: server,
    user: user
  });

  ssh.exec('free', {
    out: function(stdout) {
        return stdout;
    }
  }).start();
}

// Get list of rams
exports.index = function(req, res) {
  Ram.find(function (err, rams) {
    if(err) { return handleError(res, err); }
    return res.json(200, rams);
  });
};

// Get a single ram
exports.show = function(req, res) {
  Ram.findById(req.params.id, function (err, ram) {
    if(err) { return handleError(res, err); }
    if(!ram) { return res.send(404); }
    return res.json(ram);
  });
};

// Creates a new ram in the DB.
exports.create = function(req, res) {
  Ram.create(req.body, function(err, ram) {
    if(err) { return handleError(res, err); }
    return res.json(201, ram);
  });
};

// Updates an existing ram in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Ram.findById(req.params.id, function (err, ram) {
    if (err) { return handleError(res, err); }
    if(!ram) { return res.send(404); }
    var updated = _.merge(ram, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, ram);
    });
  });
};

// Deletes a ram from the DB.
exports.destroy = function(req, res) {
  Ram.findById(req.params.id, function (err, ram) {
    if(err) { return handleError(res, err); }
    if(!ram) { return res.send(404); }
    ram.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}