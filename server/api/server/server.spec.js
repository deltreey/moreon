'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var async = require('async');

var Server = require('./server.model'),
    Script = require('../script/script.model');

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
  var serverId = null;
  var scriptId = null;

  beforeEach(function (done) {
    async.waterfall([
      function (callback) {
        Script.create({
          name: 'test',
          command: 'echo "test"',
          defaultInterval: 1000
        }, function (error, script){
          if (error) { return callback(error); }
          scriptId = script._id;
          callback(null, script);
        });
      },
      function (script, callback) {
        Server.create({
          hostname: 'test',
          description: 'test',
          username: 'test',
          activeScripts: [{
            script: script._id,
            duration: 100
          }]
        }, function (err, server) {
          if (err) return callback(err);
          serverId = server._id;
          callback(null, server);
        });
      }], function (error, results) {
        done(error);
      });
  });

  afterEach(function (done) {
    async.waterfall([
    function (callback) {
      Server.remove({ _id: serverId },
        function (err) {
          callback(err)
        });
    },
    function (callback) {
      Script.remove({ _id: scriptId },
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
            .expect(200)
            .end(function (err) {
              if (err) { return callback(err); }
              callback();
            });
        },
        function (callback) {
          request(app)
            .delete('/api/v1/servers/' + serverId)
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
    it('should stop running jobs', function(done) {
      async.waterfall([
        function (callback) {
          request(app)
            .get('/api/v1/servers/start')
            .expect(200)
            .end(function (err) {
              if (err) { return callback(err); }
              callback();
            });
        },
        function (callback) {
          request(app)
            .put('/api/v1/servers/' + serverId)
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