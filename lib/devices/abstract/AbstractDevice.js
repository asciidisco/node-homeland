'use strict';

var Utils = require('./../../utils');

var AbstractDevice = function (options, devices, pairing) {
	this.owner = options.owner;
	this.hmId = options.hmId;
	this.model = options.model;

	// assign eventemitter
	this.devices = devices;
	this.pairing = pairing;
};

/**
 * 
 */

AbstractDevice.prototype.parse = function(event) {
	event.rssi = Utils.parseRSSI(event.rssi);
	event.uptime = Utils.parseUptime(event.uptime);
	return event;
};

/**
 * 
 */

AbstractDevice.prototype.parseDeviceEvent = function(data) {
	var event = {};
	var raw = data.split(',');
	event.type = 'device.event';
	event.hmId = raw[0].substring(1);
	event.status = raw[1];
	event.uptime = raw[2];
	event.meta = raw[3];
	event.rssi = raw[4];
	event.payload = raw[5].replace('\r\n', '');
	event = AbstractDevice.prototype.parse.bind(this)(event);
 
	if (this.model) {
		event.model = this.model;
	}

	if (this.owner) {
		event.owner = this.owner;
	}

	return event;
};

/**
 * 
 */

AbstractDevice.prototype.parseDeviceResponse = function(data) {
	var event = {};
 	var raw = data.split(',');
	event.type = 'device.response';
	event.payload = raw[5].replace('\r\n', '');
  	event.hmId = event.payload.substring(6, 12);
	event.model = this.model;
	if (this.owner) {
		event.owner = this.owner;
	}

	return event;
};

/**
 * 
 */

AbstractDevice.prototype.send = function (command) {
	var buf = Utils.convertCommandToBuffer(command);
	this.devices.send(buf, command);
};

/**
 * 
 */

AbstractDevice.prototype.getParser = function(buf, Middleware) {
	var parserMap = {
		'E': 'parseDeviceEvent',
		'R': 'parseDeviceResponse'
	};

	return function (data) {
		data = AbstractDevice.prototype[parserMap[buf.substr(0, 1)]].bind(this)(data);
		data = Middleware.prototype[parserMap[buf.substr(0, 1)]].bind(this)(data);
		return data;
	}.bind(this)
};

AbstractDevice.prototype._listenOnConnectorData = function (data) {
	console.log('Foo');
};

module.exports = AbstractDevice;