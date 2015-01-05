'use strict';

var Plug = require('./abstract/Plug');

var HMLCSw1Pl = function (options, connector) {
	this.counter = 0;
	Plug.prototype.constructor.bind(this)(options, connector);
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

module.exports = HMLCSw1Pl;