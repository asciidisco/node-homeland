'use strict';

/*
 * HM-WDS-10-TH-O Outdoor Temperature/Humidity Sensor
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

var HMWDS10THO = function (options, devices) {
	Thermostat.prototype.constructor.bind(this)(options, devices);
};

HMWDS10THO.prototype = Object.create(Thermostat.prototype);

HMWDS10THO.prototype.parse = function(data, emit) {
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

module.exports = HMWDS10THO;