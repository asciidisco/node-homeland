'use strict';

var Switch = require('../abstract/Switch');

var HMRCP1 = function (options, devices) {
	Switch.prototype.constructor.bind(this)(options, devices);
};

HMRCP1.prototype = Object.create(Switch.prototype);

HMRCP1.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Switch);
	var ret = parse(data);

	// different impl for longpress
	if (Number.isNaN(ret.button)) {
		if (ret.payload.substring(18, 20) === 'C1') {
			ret.longpress = true;
			ret.button = 1;
		}
	}

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

module.exports = HMRCP1;