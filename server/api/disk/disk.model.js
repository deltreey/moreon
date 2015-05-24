'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DiskSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Disk', DiskSchema);