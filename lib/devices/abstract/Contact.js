'use strict';

var Q = require('q');
var AbstractDevice = require('./AbstractDevice');

/**
 * 
 */

var Contact = function (options, devices) {
	AbstractDevice.prototype.constructor.bind(this)(options, devices);
};

/**
 * 
 */

Contact.prototype = Object.create(AbstractDevice.prototype);

/**
 * 
 */

Contact.prototype.parseDeviceEvent = function(event) {
	event = this.parseState(event);
	return event;
};

/**
 * 
 */

Contact.prototype.parseDeviceResponse = function(event) {
	event = this.parseState(event);
	return event;
};

/**
 * 
 */

Contact.prototype.parseState = function(event) {
	var states = {'C8': 'open', '00': 'close'};
	var _raw = event.payload.substring(22, 24);
	event.state = states[_raw];
	return event;
};

module.exports = Contact;