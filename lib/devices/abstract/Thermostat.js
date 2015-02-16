'use strict';

var AbstractDevice = require('./AbstractDevice');

var Thermostat = function (options, devices) {
	AbstractDevice.prototype.constructor.bind(this)(options, devices);
};
	
Thermostat.prototype = Object.create(AbstractDevice.prototype);

Thermostat.prototype.parseDeviceEvent = function(event) {
	event = this.parseClimate(event);
	return event;
};

Thermostat.prototype.setTemperature = function(temperature) {
};

Thermostat.prototype.parseClimate = function(event) {
	var sensorData = parseInt(event.payload.substring(18, 22), 16);

	var selTemp = ((sensorData >> 10) & 0x3f) / 2.0;
	var temperature = (sensorData & 0x3ff) / 10.0;
	var humidity = parseInt(event.payload.substring(22, 24), 16);

	event.selectedTemperature = selTemp;
	event.temperature = temperature;
	event.humidity = humidity;
	return event;
};

module.exports = Thermostat;