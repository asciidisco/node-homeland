'use strict';

/*
 * HM-WDS40-TH-I Indoor Temperature/Humidity Sensor (Version 1)
 * 
 *
 * Notification-Payload = B4865A26047600000094DC2A
 *
 * B4865A260476000000 94DC 2A => 22°C Temp, 42% Humidity
 *                    ---- --
 *                      A   B
 * Current Temperature  = ((A & 0x3ff) / 10.0
 * Current Humidity     = B
 *
 */

var Thermostat = require('../abstract/Thermostat');

var HMWDS40THI = function (options, devices) {
	Thermostat.prototype.constructor.bind(this)(options, devices);
};

HMWDS40THI.prototype = Object.create(Thermostat.prototype);

HMWDS40THI.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Thermostat);
	var ret = parse(data);

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;
	delete ret.selectedTemperature;

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

module.exports = HMWDS40THI;