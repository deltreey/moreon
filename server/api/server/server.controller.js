'use strict';

var _ = require('lodash'),
    request = require('request'),
    SSH = require('simple-ssh'),
    async = require('async');
var Server = require('./server.model'),
    Script = require('../script/script.model');
var config = require('../../config/environment');

exports.runningScripts = [];

exports.runScriptOnServer = function (server, user, script) {
  var ssh = new SSH({
    host: server,
    user: user,
    key: config.sshkey
  });

  ssh.exec(script, {
    out: function(stdout) {
      console.log(stdout);
    },
    err: function(stderr) {
      console.error(stderr);
    }
  }).start();
};

exports.startRunningScript = function (interval, server, callback) {
  async.waterfall([
    function (asyncCallback) {
      if (interval.script._id === undefined) {
        Script.findById(interval.script, function (err, script) {
          if (err) { return asyncCallback(err); }
          interval.script = script.toObject();
          asyncCallback(null, interval);
        });
      }
      else {
        asyncCallback(null, interval)
      }
    }],
    function (error, results) {
      if (error) { return callback(error); }
      var newInterval = setInterval(exports.runScriptOnServer, results.duration, server.hostname, server.username, results.script.command);
      exports.runningScripts.push({
        action: newInterval,
        id: results._id
      });
      callback();
    });
};

exports.stopRunningScript = function (interval, callback) {
  var data = interval._id;
  if (data === undefined) {
    data = interval;
  }
  var index = -1;
  for (var i = 0; i < exports.runningScripts.length; ++i) {
    if (exports.runningScripts[i].id.toString() === data.toString()) {
      index = i;
      clearInterval(exports.runningScripts[i].action);
      break;
    }
  }

  if (index === -1) {
    return callback('That interval ID is not running.');
  }
  exports.runningScripts.splice(index, 1);
  callback();
};

// Start Intervals
exports.start = function (req, res) {
  Server.find({})
    .populate('activeScripts.script')
    .exec(function (err, servers) {
    if(err) { return handleError(res, err); }
    async.each(servers, function (server, serverCallback) {
      async.each(server.activeScripts, function (interval, intervalCallback) {
        exports.startRunningScript(interval, server, intervalCallback);
        }, function (error) {
            serverCallback(error);
        });
    }, function (error) {
      if (error) { return handleError(res, error); }
      res.send(200);
    });
  });
};

exports.start(null, {
  send: function (value, object) {
    if (value === 200) {
      console.log('Intervals Started');
    }
    else {
      console.error(object);
    }
  }
});

// Get list of servers
exports.index = function(req, res) {
  Server.find(function (err, servers) {
    if(err) { return handleError(res, err); }
    return res.json(200, servers);
  });
};

// Get a single server
exports.show = function(req, res) {
  Server.findById(req.params.id)
    .populate('activeScripts.script')
    .exec(function (err, server) {
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
  for (var s = 0; s < req.body.activeScripts.length; ++s) {
    if (typeof(req.body.activeScripts[s].script) === typeof({})) {
      req.body.activeScripts[s].script = req.body.activeScripts[s].script._id;
    }
  }
  async.waterfall([
    function (callback) {
      // Get original server
      Server.findById(req.params.id, function (err, server) {
        if (err) { return callback(err); }
        if(!server) { return callback('404'); }
        callback(null, server, req.body);
      });
    }, function (oldServer, server, callback) {
      // turn off the old scripts
      async.each(oldServer.activeScripts, exports.stopRunningScript, function (error) {
        if (error) { return callback(error); }
        callback(null, oldServer, server);
      });
    }, function (oldServer, server, callback) {
      // update server with new info
      var oldIds = _.difference(oldServer, server);
      oldServer.update({ _id: oldServer._id }, {
        hostname: server.hostname || oldServer.hostname,
        description: server.description || oldServer.description,
        username: server.username || oldServer.username,
        $pull: { activeScripts: { $in: oldIds } },
        $addToSet: { activeScripts: { $each: server.activeScripts } }
      });
      callback(null, oldServer);
    }, function (updated, callback) {
      // start new scripts
      async.each(updated.activeScripts, function (interval, scriptCallback) {
        exports.startRunningScript(interval, updated, function (error) {
          if (error) { return scriptCallback(error); }
          return scriptCallback();
        });
      }, function (error, result) {
        if (error) { return callback(error); }
        return callback(null, result);
      });
    }], function (error, result) {
      if (error === '404') {
        return res.send(404);
      }
      else if (error) { 
        return handleError(res, error);
      }
      else {
        return res.json(200, result);
      }
    });
};

// Deletes a server from the DB.
exports.destroy = function(req, res) {
  Server.findById(req.params.id)
    .exec(function (err, server) {
    if(err) { return handleError(res, err); }
    if(!server) { return res.send(404); }
    server.remove(function(err) {
      if(err) { return handleError(res, err); }
      async.each(server.activeScripts, exports.stopRunningScript, function (error) {
        if (error) { return handleError(res, error); }
        return res.send(204);
      });
    });
  });
};

function handleError(res, err) {
  console.error(err);
  return res.send(500, err);
}