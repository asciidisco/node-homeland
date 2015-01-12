'use strict';

var Contact = require('../abstract/Contact');

var HMSecSC = function (options, devices) {
	Contact.prototype.constructor.bind(this)(options, devices);
};

HMSecSC.prototype = Object.create(Contact.prototype);

HMSecSC.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Contact);
	var ret = parse(data);

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

module.exports = HMSecSC;