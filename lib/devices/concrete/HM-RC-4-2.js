'use strict';

var Switch = require('../abstract/Switch');

var HMRC42 = function (options, devices) {
	Switch.prototype.constructor.bind(this)(options, devices);
};

HMRC42.prototype = Object.create(Switch.prototype);

HMRC42.prototype.parse = function(data, emit) {
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

module.exports = HMRC42;