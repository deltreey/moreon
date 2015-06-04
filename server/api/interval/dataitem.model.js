'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var DataitemSchema = new Schema({
	value: Number,
	timestamp: Date
});

module.exports = mongoose.model('Dataitem', DataitemSchema);