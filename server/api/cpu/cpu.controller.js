'use strict';

var _ = require('lodash');
var Cpu = require('./cpu.model');
var SSH = require('simple-ssh');

function getDiskUsage(server, user) {
  var ssh = new SSH({
    host: server,
    user: user
  });

  ssh.exec('top -n 1', {
    out: function(stdout) {
        return stdout;
    }
  }).start();
}

// Get list of cpus
exports.index = function(req, res) {
  Cpu.find(function (err, cpus) {
    if(err) { return handleError(res, err); }
    return res.json(200, cpus);
  });
};

// Get a single cpu
exports.show = function(req, res) {
  Cpu.findById(req.params.id, function (err, cpu) {
    if(err) { return handleError(res, err); }
    if(!cpu) { return res.send(404); }
    return res.json(cpu);
  });
};

// Creates a new cpu in the DB.
exports.create = function(req, res) {
  Cpu.create(req.body, function(err, cpu) {
    if(err) { return handleError(res, err); }
    return res.json(201, cpu);
  });
};

// Updates an existing cpu in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Cpu.findById(req.params.id, function (err, cpu) {
    if (err) { return handleError(res, err); }
    if(!cpu) { return res.send(404); }
    var updated = _.merge(cpu, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, cpu);
    });
  });
};

// Deletes a cpu from the DB.
exports.destroy = function(req, res) {
  Cpu.findById(req.params.id, function (err, cpu) {
    if(err) { return handleError(res, err); }
    if(!cpu) { return res.send(404); }
    cpu.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}