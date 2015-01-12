'use strict';

var Plug = require('../abstract/Plug');

var HMLCSw1Pl = function (options, devices) {
	this.counter = 0;
	Plug.prototype.constructor.bind(this)(options, devices);
};

HMLCSw1Pl.prototype = Object.create(Plug.prototype);

HMLCSw1Pl.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Plug);
	var ret = parse(data);

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

HMLCSw1Pl.model = '0011';

module.exports = HMLCSw1Pl;