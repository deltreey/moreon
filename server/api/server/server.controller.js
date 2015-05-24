'use strict';

var _ = require('lodash');
var Server = require('./server.model');

// Get list of servers
exports.index = function(req, res) {
  Server.find(function (err, servers) {
    if(err) { return handleError(res, err); }
    return res.json(200, servers);
  });
};

// Get a single server
exports.show = function(req, res) {
  Server.findById(req.params.id, function (err, server) {
    if(err) { return handleError(res, err); }
    if(!server) { return res.send(404); }
    return res.json(server);
  });
};

// Creates a new server in the DB.
exports.create = function(req, res) {
  Server.create(req.body, function(err, server) {
    if(err) { return handleError(res, err); }
    return res.json(201, server);
  });
};

// Updates an existing server in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Server.findById(req.params.id, function (err, server) {
    if (err) { return handleError(res, err); }
    if(!server) { return res.send(404); }
    var updated = _.merge(server, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, server);
    });
  });
};

// Deletes a server from the DB.
exports.destroy = function(req, res) {
  Server.findById(req.params.id, function (err, server) {
    if(err) { return handleError(res, err); }
    if(!server) { return res.send(404); }
    server.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}