'use strict';

var Switch = require('./abstract/Switch');

var HMPB2WM55 = function (options) {
	Switch.prototype.constructor.bind(this)(options);
};

HMPB2WM55.prototype = Object.create(Switch.prototype);

HMPB2WM55.prototype.parse = function(data, emit) {
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

module.exports = HMPB2WM55;