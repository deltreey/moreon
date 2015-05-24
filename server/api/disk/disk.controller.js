'use strict';

var _ = require('lodash');
var Disk = require('./disk.model');
var SSH = require('simple-ssh');

function getDiskUsage(server, user) {
  var ssh = new SSH({
    host: server,
    user: user
  });

  ssh.exec('df -h', {
    out: function(stdout) {
        return stdout;
    }
  }).start();
}

// Get list of disks
exports.index = function(req, res) {
  Disk.find(function (err, disks) {
    if(err) { return handleError(res, err); }
    return res.json(200, disks);
  });
};

// Get a single disk
exports.show = function(req, res) {
  Disk.findById(req.params.id, function (err, disk) {
    if(err) { return handleError(res, err); }
    if(!disk) { return res.send(404); }
    return res.json(disk);
  });
};

// Creates a new disk in the DB.
exports.create = function(req, res) {
  Disk.create(req.body, function(err, disk) {
    if(err) { return handleError(res, err); }
    return res.json(201, disk);
  });
};

// Updates an existing disk in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Disk.findById(req.params.id, function (err, disk) {
    if (err) { return handleError(res, err); }
    if(!disk) { return res.send(404); }
    var updated = _.merge(disk, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, disk);
    });
  });
};

// Deletes a disk from the DB.
exports.destroy = function(req, res) {
  Disk.findById(req.params.id, function (err, disk) {
    if(err) { return handleError(res, err); }
    if(!disk) { return res.send(404); }
    disk.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}