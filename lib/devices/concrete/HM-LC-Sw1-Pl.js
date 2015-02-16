'use strict';

var Plug = require('../abstract/Plug');

/**
 * 
 */

var HMLCSw1Pl = function (options, devices) {
	this.counter = 0;
	Plug.prototype.constructor.bind(this)(options, devices);
};

// get the methods from the abstract plug defintion
HMLCSw1Pl.prototype = Object.create(Plug.prototype);

/**
 * 
 */

HMLCSw1Pl.prototype.parse = function(data, emit) {
	var ret = this.getParser(data, Plug)(data);

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

// Hexadecimal model definition 
// (used to identify the device during the pairing process)
HMLCSw1Pl.model = '0011';

module.exports = HMLCSw1Pl;