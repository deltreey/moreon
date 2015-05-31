'use strict';

var _ = require('lodash'),
    request = require('request'),
    SSH = require('simple-ssh'),
    async = require('async');
var Server = require('./server.model'),
    Script = require('../script/script.model'),
    Interval = require('./interval.model');
var config = require('../../config/environment');

exports.runningScripts = [];

// Start Intervals
exports.start = function (req, res) {
  Server.find({})
    .populate('activeScripts.script')
    .exec(function (err, servers) {
    if(err) { return handleError(res, err); }
    async.each(servers, function (server, serverCallback) {
      async.each(server.activeScripts, function (interval, intervalCallback) {
        new StartRunningScript(interval, server, intervalCallback);
        }, function (error) {
            serverCallback(error);
        });
    }, function (error) {
      if (error) { return handleError(res, error); }
      res.send(200);
    });
  });
};

exports.execute = function (req, res) {
  Server.findById(req.params.serverId, function (err, server) {
    if (err) { return handleError(res, err); }
    if (!server) { return res.send(404); }
    var intervalIndex = _.findIndex(server.activeScripts, function (activeScript) {
      return activeScript._id.toString() === req.params.intervalId.toString();
    });
    var interval = server.activeScripts[intervalIndex];

    Script.findById(interval.script, function (err, script) {
      if (err) { return handleError(res, err); }
      if (!script) { return handleError(res, 'The script for that interval could not be found.'); }
      new RunScript(server.hostname, server.username, script.command, function (err, results) {
        if (err) { return handleError(res, err); }
        res.send(200, results);
      });
    });
  });
};

// Get list of servers
exports.index = function(req, res) {
  Server.find()
    .populate('activeScripts.script')
    .exec(function (err, servers) {
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
      async.each(oldServer.activeScripts, StopRunningScript, function (error) {
        callback(error, oldServer, server);
      });
    }, function (oldServer, server, callback) {
      // update server with new info; remove old intervals
      var oldIds = _.difference(oldServer, server);
      Server.update({ _id: oldServer._id },
        { 
          hostname: server.hostname || oldServer.hostname,
          description: server.description || oldServer.description,
          username: server.username || oldServer.username
        },
        { $pullAll: { activeScripts: oldIds } },
        function (err) {
          callback(err, oldServer, server);
      });
    }, function (oldServer, server, callback) {
      // update server with new info; add new intervals
      Server.update({ _id: oldServer._id },
        { $addToSet: { activeScripts: { $each: server.activeScripts } } },
        function (err) {
          callback(err, oldServer);
      });
    }, function (oldServer, callback) {
      Server.findById(oldServer._id, function (err, server) {
        callback(err, server);
      });
    }, function (updated, callback) {
      // start new scripts
      async.each(updated.activeScripts, function (interval, scriptCallback) {
        new StartRunningScript(interval, updated, function (error) {
          if (error) { return scriptCallback(error); }
          return scriptCallback();
        });
      }, function (error, result) {
        return callback(error, result);
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
      async.each(server.activeScripts, StopRunningScript, function (error) {
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

function IsNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function RunScript (hostname, username, command, callback) {
  var ssh = new SSH({
    host: hostname,
    user: username,
    key: config.sshkey
  });

  ssh.exec(command, {
    out: function(stdout) {
      callback(null, stdout);
    },
    err: function(stderr) {
      console.error(stderr);
    }
  }).start();
}

function RunScriptOnServer (server, interval) {
  new RunScript(
    server.hostname,
    server.username,
    interval.script.command,
    function (err, results) {
      if (err) { return console.error(err); }
      if (new IsNumber(results)) {
        var intervalIndex = _.findIndex(server.activeScripts, function (activeScript) {
          return activeScript._id.toString() === interval._id.toString();
        });
        var intervalObject = {};
        intervalObject['activeScripts.' + intervalIndex + '.results'] = {
          value: parseFloat(results),
          timestamp: new Date()
        };

        Server.update({ _id: server._id }, {
          $push: intervalObject
        }, function (err) {
          if (err) { console.error(err); }
        });
      }
      else {
        console.error('stdout: ' + results +
          'is not a number! from Script: "' + interval.script.command + '" on Server ' + server);
      }
    });
}

function StartRunningScript (interval, server, callback) {
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

      var newInterval = setInterval(
        RunScriptOnServer,
        results.duration,
        server,
        results);
      exports.runningScripts.push({
        action: newInterval,
        id: results._id
      });
      callback();
    });
}

function StopRunningScript (interval, callback) {
  var data = interval._id;
  if (data === undefined) {
    data = interval;
  }
  var scriptIndex = _.findIndex(exports.runningScripts, function (script) {
    return script.id.toString() === data.toString();
  });

  if (scriptIndex === -1) {
    callback('That interval ID is not running.');
  }
  else {
    clearInterval(exports.runningScripts[scriptIndex].action);
    exports.runningScripts.splice(scriptIndex, 1);
    callback();
  }
}

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
