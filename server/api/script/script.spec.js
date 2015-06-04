'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Script = require('./script.model');

describe('GET /api/v1/scripts', function() {

  it('should create initial scripts and respond with JSON array when there are no scripts in the db', function(done) {
    Script.remove({}, function (err) {
      request(app)
        .get('/api/v1/scripts')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          done();
        });
    });
  });
});
