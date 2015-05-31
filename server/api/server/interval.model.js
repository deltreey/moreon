'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;
var Dataitem = require('./dataitem.model');

var IntervalSchema = new Schema({
	script: { type: Schema.Types.ObjectId, ref: 'Script' },
	duration: Number,
	results: [Dataitem.schema]
});

module.exports = mongoose.model('Interval', IntervalSchema);