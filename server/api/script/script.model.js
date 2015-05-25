'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScriptSchema = new Schema({
  name: String,
  command: String,
  defaultInterval: Number
});

module.exports = mongoose.model('Script', ScriptSchema);