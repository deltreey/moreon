'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ServerSchema = new Schema({
  hostname: String,
  description: String,
  username: String,
  activeScripts: [{ type: Schema.Types.ObjectId, ref: 'Interval' }]
});

module.exports = mongoose.model('Server', ServerSchema);