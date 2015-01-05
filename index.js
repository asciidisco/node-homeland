'use strict';

var EventEmitter = require('events').EventEmitter;
var Q = require('q');

// device manager
var Devices = require('./lib/devices');

// connector interfaces
var Connector = {};
Connector.USB = require('./lib/connector/usb');

function Homematic (options) {
	options = options || {}; 
	// default options
	this.options = {
		interface: 'usb',
		port: 1000,
		ip: true
	};

	Object.keys(options).forEach(function (key) {
		if (this.options[key]) {
			this.options[key] = options[key];
		}
	}.bind(this));

	this.connector = null;
	this.devices = new Devices();
};

// import event emitter
Homematic.prototype = Object.create(EventEmitter.prototype);

// connect with the connector
Homematic.prototype.connect = function() {
	var deferred = Q.defer();

	if (Connector[this.options.interface.toUpperCase()]) {
		this.connector = new (Connector[this.options.interface.toUpperCase()])(this.options);
		this._listen();
		this.connector.connect().then(function () {
			deferred.resolve(this);
			this.devices.connector = this.connector;
		}.bind(this), deferred.reject);
	} else {
		deferred.reject(new Error('No matching connector available for:' + this.options.interface));
		return;
	}

	return deferred.promise;
};

Homematic.prototype.reboot = function() {
	return this.connector.reboot();
};

Homematic.prototype.setOwner = function(owner) {
	return this.connector.setOwner(owner);
};

Homematic.prototype.addDevice = function(hmId, model) {
	this.devices.addDevice({hmId: hmId, model: model, owner: this.connector.owner});
};

Homematic.prototype._listen = function() {
	this.connector.on('data', this._processIncoming.bind(this));
	this.connector.on('ready', this.emit.bind(this, 'ready'));
	this.devices.on('add', this.emit.bind(this, 'device.add'));
};

Homematic.prototype._processIncoming = function(data) {
	console.log('Incoming Data', data);
	if (this.devices.isConnectedDevice(data)) {
		this.devices.getDeviceFromDataStream(data).parse(data, this.emit.bind(this));
	}
};

module.exports = Homematic;