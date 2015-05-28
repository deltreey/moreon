'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Interval = require('./interval.model')

var ServerSchema = new Schema({
  hostname: String,
  description: String,
  username: String,
  activeScripts: [Interval.schema]
});

module.exports = mongoose.model('Server', ServerSchema);