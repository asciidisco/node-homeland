'use strict';

/*
 * HM-CC-TC Temperature/Humidity Sensor & Temperature Actuator
 * 
 *
 * Notification-Payload = B4865A26047600000094DC2A
 *
 * B4865A260476000000 94DC 2A => 18,5°C SetTemp =>  22°C Temp, 42%
 *                    ---- --
 *                      A   B
 * Selected Temperature = ((A >> 10) & 0x3f) / 2.0
 * Current Temperature  = ((A & 0x3ff) / 10.0
 * Current Humidity     = B
 *
 */

var Thermostat = require('../abstract/Thermostat');

var HMCCTC = function (options, devices) {
	Thermostat.prototype.constructor.bind(this)(options, devices);
};

HMCCTC.prototype = Object.create(Thermostat.prototype);

HMCCTC.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Thermostat);
	var ret = parse(data);

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

HMCCTC.model = '0039';

module.exports = HMCCTC;