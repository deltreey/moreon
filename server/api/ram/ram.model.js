'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RamSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Ram', RamSchema);