'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var async = require('async');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var server = request.agent("http://localhost:9000");

var Server = require('./server.model'),
    Script = require('../script/script.model'),
    User = require('../user/user.model');

describe('GET /api/v1/servers', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/v1/servers')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('Integration Tests', function() {
  this.timeout(10000);
  
  var token = null;
  var testServer = {
    hostname: 'test',
    description: 'test',
    username: 'test'
  };
  var testScript = {
    name: 'test',
    command: 'echo "test"',
    defaultInterval: 1000
  };
  var testUser = {
    provider: 'local',
    name: 'Test User',
    email: 'testUser@test.com',
    password: 'testUser'
  };

  beforeEach(function (done) {
    async.waterfall([
      function (callback) {
        User.create(testUser, function (error, user) {
          if (error) { return callback(error); }
          testUser = user.toObject();
          callback();
        });
      },
      function (callback) {
        Script.create(testScript, function (error, script) {
          if (error) { return callback(error); }
          testScript = script.toObject();
          callback();
        });
      },
      function (callback) {
        testServer.activeScripts = [{
          script: testScript._id,
          duration: 100
        }];

        Server.create(testServer, function (err, server) {
          if (err) return callback(err);
          testServer = server.toObject();
          callback();
        });
      },
      function (callback) {
        // authenticate user
        token = jwt.sign({ _id: testUser._id }, config.secrets.session, { expiresInMinutes: 1 });
        callback();
      }], function (error, results) {
        done(error);
      });
  });

  afterEach(function (done) {
    async.waterfall([
    function (callback) {
      Server.remove({ _id: testServer._id },
        function (err) {
          callback(err)
        });
    },
    function (callback) {
      Script.remove({ _id: testScript._id },
        function (err) {
          callback(err)
        });
    },
    function (callback) {
      User.remove({ _id: testUser._id },
        function (err) {
          callback(err)
        });
    }], function (error, results) {
      done(error);
    });
  });

  describe('DELETE /api/v1/servers/:id', function() {
    it('should stop running jobs', function(done) {
      async.waterfall([
        function (callback) {
          request(app)
            .get('/api/v1/servers/start')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end(function (err, res) {
              if (err) { return callback(err); }
              callback();
            });
        },
        function (callback) {
          request(app)
            .delete('/api/v1/servers/' + testServer._id)
            .set('Authorization', 'Bearer ' + token)
            .expect(204)
            .end(function (err) {
              if (err) return callback(err);
              callback();
            });
        }], function (error) {
          done(error);
        });
    });
  });
  describe('UPDATE /api/v1/servers/:id', function() {
    it('should stop running jobs when they\'re deleted', function(done) {
      async.waterfall([
        function (callback) {
          request(app)
            .get('/api/v1/servers/start')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end(function (err, res) {
              if (err) { return callback(err); }
              callback();
            });
        },
        function (callback) {
          request(app)
            .put('/api/v1/servers/' + testServer._id)
            .set('Authorization', 'Bearer ' + token)
            .send({ activeScripts: [] })
            .expect(200)
            .end(function (err) {
              if (err) return callback(err);
              callback();
            });
        }], function (error) {
          done(error);
        });
    });
  });
});
