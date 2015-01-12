'use strict';

var EventEmitter = require('events').EventEmitter;
var Q = require('q');

// device manager
var Devices = require('./lib/devices');
// pairing manager
var Pairing = require('./lib/pairing');

// connector interfaces
var Connector = {};
Connector.USB = require('./lib/connector/usb');

/**
 * 
 */

function Homeland (options) {
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
	this.pairing = null;
	this.ee = new EventEmitter();
	this.devices = new Devices();
};

/**
 * Import event emitter
 */

Homeland.prototype = Object.create(EventEmitter.prototype);

/**
 * Connect with the coordinator (HM-CFG-USB2 or HM-CFG-LAN)
 * 
 * 
 */

Homeland.prototype.connect = function(options, cb) {
	var deferred = Q.defer();

	if (Connector[this.options.interface.toUpperCase()]) {
		this.connector = new (Connector[this.options.interface.toUpperCase()])(this.options);
		this._listen();
		this.connector.connect().then(function () {
			this.pairing = new Pairing(this.connector, this.devices, this.ee);
			deferred.resolve(this);
		}.bind(this)).catch(deferred.reject);
	} else {
		deferred.reject(new Error('No matching connector available for:' + this.options.interface));
		return;
	}

	return deferred.promise;
};

/**
 * Reboots the coordinator (implies a downtime of ~30 seconds).
 * 
 * @method reboot
 * @param {function} cb A callback function [optional]
 * @return {promise} A Q.promise object
 */

Homeland.prototype.reboot = function(cb) {
	return this.connector.reboot(cb);
};

/**
 * Sets the owner.
 * Must be a 6 character hex value (default 424242)
 * This is needed to control & pair devices (receiving broadcasts works without).
 *
 * The coordinator usually already comes with an id, I highly recommend to change
 * the id to somehting specific. All the devices that get paired will get this
 * owner id & only interact with an coordinator with that specific owner id.
 *
 * If the owner is already set to the value given, nothing happens, if the owner
 * needs to be changed on the coordinator it gets rebooted, which implies a downtime
 * of ~30 seconds.
 * 
 * @method setOwner
 * @param {string} owner Hex representation of the owner id [optional]
 * @param {function} cb A callback function [optional]
 * @return {promise} A Q.promise object
 */

Homeland.prototype.startPairing = function(sec, cb) {
	return this.pairing.startPairing(sec, cb);
};

/**
 * Sets the owner.
 * Must be a 6 character hex value (default 424242)
 * This is needed to control & pair devices (receiving broadcasts works without).
 *
 * The coordinator usually already comes with an id, I highly recommend to change
 * the id to somehting specific. All the devices that get paired will get this
 * owner id & only interact with an coordinator with that specific owner id.
 *
 * If the owner is already set to the value given, nothing happens, if the owner
 * needs to be changed on the coordinator it gets rebooted, which implies a downtime
 * of ~30 seconds.
 * 
 * @method setOwner
 * @param {string} owner Hex representation of the owner id [optional]
 * @param {function} cb A callback function [optional]
 * @return {promise} A Q.promise object
 */

Homeland.prototype.setOwner = function(owner, cb) {
	owner = owner || this.devices.owner || 424242;
	this.devices.owner = owner;
	return this.connector.setOwner(owner, cb);
};

/**
 * Adds a device which can then be controlled & 
 * receive events 
 *
 * This is not *pairing* or *device inclusion*, this is for telling
 * the system which already paired devices should be exposed via the interface
 * A device must be paired first before it can be added to the runtime using this method
 *
 * At minimum the method expects an object literal with an `id` (which is the unique hmId of the device)
 * and the `model` of the device (smth. like `HM-CC-TC`)
 * Additionally, you can supply any information you want (like a `name` or the devices `serialNo`),
 * the information will be persistet in the session and remains untuoched but accessible
 *
 * If the promise will be resolved (or the callback will be called without an error), you receive
 * an instance of the concrete device
 * 
 * @method addDevice
 * @param {object} deviceMeta Object literal that describes device meta data
 * @param {function} cb A callback function [optional]
 * @return {promise} A Q.promise object
 */

Homeland.prototype.addDevice = function(deviceMeta, cb) {
	var deferred = Q.defer();
	var _err = null;
	var _cb = typeof cb === 'function' ? cb : function () {};

	// check if we have device meta data
	if ((deviceMeta !== Object(deviceMeta)) || (Object.prototype.toString.call(deviceMeta) === '[object Array]')) {
		_err = new Error('[addDevice]: No device meta data given - must be an object literal with at least 2 properties: {id: "12345", model: "HM-CC-TC"}');
		_cb(err, null);
		deferred.reject(_err);
		return deferred.promise;
	}

	// check if we have valid device meta data
	if (!deviceMeta.id || !deviceMeta.model) {
		_err = new Error('[addDevice]: No device meta data given - must be an object literal with at least 2 properties: {id: "12345", model: "HM-CC-TC"}');
		_cb(err, null);
		deferred.reject(_err);
		return deferred.promise;
	}

	// generate a device instance
	var _device = this.devices.addDevice({hmId: deviceMeta.id, model: deviceMeta.model, owner: (deviceMeta.owner || this.connector.owner)}, deviceMeta);
	deferred.resolve(_device);
	cb(_err, _device);

	return deferred.promise; 
};

/**
 *
 */

Homeland.prototype._listen = function() {
	this.connector.on('data', this._processIncoming.bind(this));
	this.connector.on('ready', this.emit.bind(this, 'ready'));
	this.devices.on('add', this.emit.bind(this, 'device.add'));
	this.devices.on('internal.sendCommand', this._commandListener.bind(this));
};

/**
 *
 */

Homeland.prototype._processIncoming = function(data) {
	this.emit('broadcast', data);
	
	// invalid
	//data = 'E1936D6,0000,0030090B,FF,FFDB,2486701936D600000000D22E80424242000F71F8000000000000000000000000000000000000000000000000000000000000';
	// valid
	data = 'E1936D6,0000,000BA8F9,FF,FFE2,C584001936D60000002100394A4551303034343330355800FFFF000000000000000000000000000000000000000000000000';


	if (this.devices.isConnectedDevice(data)) {
		this.devices.getDeviceFromDataStream(data).parse(data, this.emit.bind(this));
	} else {
		if (this.pairing.isValidPairingRequest(data) && this.pairing.isPairingModeActive()) {
			this.pairing.startPairingFlow(data);
		} else {
			console.log('Unknown:', data);
		}
	}
};

/**
 *
 */

Homeland.prototype._commandListener = function(buf, text) {
	console.log('Outgoing Data:', text);
	this.connector.send(buf);
};

module.exports = Homeland;