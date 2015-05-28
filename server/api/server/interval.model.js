'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var IntervalSchema = new Schema({
	script: { type: Schema.Types.ObjectId, ref: 'Script' },
	duration: Number
});

module.exports = mongoose.model('Interval', IntervalSchema);