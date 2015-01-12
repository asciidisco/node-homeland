'use strict';

var Switch = require('../abstract/Switch');

var HMRC12B = function (options, devices) {
	Switch.prototype.constructor.bind(this)(options, devices);
	this.currentEvent = {button: -1, counter: 0};
};

HMRC12B.prototype = Object.create(Switch.prototype);

HMRC12B.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Switch);
	var ret = parse(data);

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	// the remote sends each button press 3 times
	// so we need to catch this & only emit once
	if (ret.button !== this.currentEvent.button || ret.longpress === true) {
		// emit the device.event
		emit(ret.type, ret);
		this.currentEvent.button = ret.button;
		this.currentEvent.counter++;
	} else {
		this.currentEvent.counter++;
	}
		
	// reset the event counter
	if (this.currentEvent.counter === 3 || ret.longpress === true) {
		this.currentEvent = {button: -1, counter: 0};
	}

	return ret;
};

module.exports = HMRC12B;