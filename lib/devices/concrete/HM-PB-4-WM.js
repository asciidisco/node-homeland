'use strict';

var Switch = require('../abstract/Switch');

var HMPB4WM = function (options, devices) {
	Switch.prototype.constructor.bind(this)(options, devices);
};

HMPB4WM.prototype = Object.create(Switch.prototype);

HMPB4WM.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Switch);
	var ret = parse(data);

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

module.exports = HMPB4WM;