'use strict';

var _ = require('lodash'),
    request = require('request'),
    SSH = require('simple-ssh'),
    async = require('async');
var Server = require('./server.model'),
    Script = require('../script/script.model'),
    Interval = require('../interval/interval.model');
var config = require('../../config/environment');

exports.runningScripts = [];

// Start Intervals
exports.start = function (req, res) {
  async.waterfall([
    function (callback) {
      Server.find(function (err, servers) {
        callback(err, servers)
      });
    },
    function (servers, callback) {
      async.each(servers, function (server, eachCallback) {
        Interval.find({ _id: { $in: server.activeScripts } }, { results: 0 })
          .populate('script')
          .exec(function (err, intervals) {
            if (err) { return eachCallback(err); }
            async.each(intervals, function (interval, intervalCallback) {
              new StartRunningScript(interval, server, intervalCallback);
            }, function (err, results) {
              eachCallback(err, results);
            });
        });
      }, function (err, results) {
        callback(err, results);
      });
    }], function (err) {
      if (err) { return handleError(res, err); }
      res.send(200);
    });
};

// Get list of servers
exports.index = function(req, res) {
  Server.find(function (err, servers) {
    if(err) { return handleError(res, err); }
    return res.json(200, servers);
  });
};

exports.display = function (req, res) {
  async.waterfall([
    function (callback) {
      Server.find(function (err, servers) {
        callback(err, servers)
      });
    },
    function (servers, callback) {
      async.each(servers, function (server, eachCallback) {
        Interval.aggregate([
          { $match: { _id: { $in: server.activeScripts } } },
          { $unwind: '$results' }, 
          { $sort: { 'results.timestamp': -1 } },
          { $limit: 10 },
          { $group: { _id:'$_id', answers: { $push: '$results' } } }
        ], function (err, intervals) {
          if (err) { return eachCallback(err); }
          server.activeScripts = intervals;
          eachCallback(null, servers);
        });
      },
      function (err, results) {
        callback(err, results);
      });
    },
    function (servers, callback) {
      var displayServers = _.compact(_.map(servers,
        function (server) {
          return server.activeScripts.length > 0;
        }
      ));
    }],
    function (err, results) {
      if (err) { return handleError(res, err); }
      return res.json(200, results);
    });
};

// Get a single server
exports.show = function(req, res) {
  Server.findById(req.params.id, function (err, server) {
    if(err) { return handleError(res, err); }
    if(!server) { return res.send(404); }
    Interval.find({ _id: { $in: server.activeScripts } }, { results: 0 })
      .populate('script')
      .exec(function (err, intervals) {
        if(err) { return handleError(res, err); }
        server = server.toObject()
        server.activeScripts = intervals;
        return res.json(server);
    });
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
    },
    function (oldServer, server, callback) {
      // stop running scripts
      Interval.find({ _id: { $in: oldServer.activeScripts } }, { results: 0 })
        .populate('script')
        .exec(function (err, intervals) {
          if (err) { return callback(err); }
          async.each(intervals, StopRunningScript, function (err, results) {
            callback(err, oldServer, server);
          });
      });
    },
    function (oldServer, server, callback) {
      // create new intervals for those that are new, remap to IDs
      async.map(server.activeScripts, function (script, mapCallback) {
        if (script._id === undefined) {
          Interval.create(script, function (err, interval) {
            mapCallback(err, interval._id);
          });
        }
        else {
          // or update them if they exist
          Interval.findById(script._id, function (err, original) {
            if (err) { return mapCallback(err); }
            delete script._id
            var updated = _.merge(original, script);
            updated.save(function (err) {
              mapCallback(err, original._id);
            });
          });
        }
      }, function (err, results) {
        server.activeScripts = results;
        callback(err, oldServer, server);
      });
    },
    function (oldServer, server, callback) {
      // update server with new info; remove old intervals
      var oldIds = _.difference(oldServer.activeScripts, server.activeScripts);
      Server.update({ _id: oldServer._id },
        { 
          hostname: server.hostname || oldServer.hostname,
          description: server.description || oldServer.description,
          username: server.username || oldServer.username,
          $pullAll: { activeScripts: oldIds }
        },
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
      // pull server, with the new interval ids
      Server.findById(oldServer._id, function (err, server) {
        callback(err, server);
      });
    }, function (updated, callback) {
      // run the new scripts
      async.each(updated.activeScripts, function (interval, intervalCallback) {
        new StartRunningScript(interval, updated, intervalCallback);
      }, function (error) {
        callback(error, updated);
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
    //timeout: 2000
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
          if (activeScript._id === undefined) {
            return activeScript.toString() === interval._id.toString();
          }
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
      if (interval._id === undefined) {
        Interval.findById(interval, { results: 0 })
          .populate('script')
          .exec(function (err, intervalObj) {
            asyncCallback(err, intervalObj)
        });
      }
      else {
        asyncCallback(null, interval);
      }
    },
    function (interval, asyncCallback) {
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
