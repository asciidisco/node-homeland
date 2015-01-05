'use strict';

var EventEmitter = require('events').EventEmitter;

var RawDevices = {};
RawDevices['HM-PB-2-WM55'] = require('./devices/HM-PB-2-WM55');
RawDevices['HM-LC-Sw1-Pl'] = require('./devices/HM-LC-Sw1-Pl');

function Devices (options, connector) {
	this.devices = {};
	this.connector = connector;
};

// import event emitter
Devices.prototype = Object.create(EventEmitter.prototype);

Devices.prototype.addDevice = function(device) {
	if (!!RawDevices[device.model]) {
		this.devices[device.hmId] = new (RawDevices[device.model])(device, this.connector);
		this.emit('add', this.devices[device.hmId]);
	}
	return this;
};

Devices.prototype.isConnectedDevice = function(data) {
	var _hmId = data.split(',')[0].substr(1);
	return !!this.devices[_hmId];
};

Devices.prototype.getDeviceFromDataStream = function(data) {
	var _hmId = data.split(',')[0].substr(1);
	return this.devices[_hmId];
};

module.exports = Devices;