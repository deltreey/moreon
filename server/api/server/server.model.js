'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ScriptSchema = require('../script/script.model');

var ServerSchema = new Schema({
  hostname: String,
  description: String,
  username: String,
  activeScripts: [ScriptSchema],
  durations: [Number]
});

module.exports = mongoose.model('Server', ServerSchema);