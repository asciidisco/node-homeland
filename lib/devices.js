'use strict';

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

/**
 *
 */

function Devices (options, ee) {
	this.devices = {};
	this.rawDevices = this.loadRawDevices();
	this.ee = ee;
};

// import event emitter
Devices.prototype = Object.create(EventEmitter.prototype);

/**
 *
 */

Devices.prototype.addDevice = function(deviceMeta, additionalMetaData) {
	if (!!this.rawDevices[deviceMeta.model]) {
		this.devices[deviceMeta.hmId] = new (this.rawDevices[deviceMeta.model])(deviceMeta, this);
		this.emit('add', this.devices[deviceMeta.hmId]);
		return this.devices[deviceMeta.hmId];
	}
	return this;
};

/**
 *
 */

Devices.prototype.isConnectedDevice = function(data) {
	var _hmId = this.parseHmId(data);
	return !!this.devices[_hmId];
};

/**
 *
 */

Devices.prototype.getDeviceFromDataStream = function(data) {
	var _hmId = this.parseHmId(data);
	return this.devices[_hmId];
};

/**
 * Loads the 'concrete' device definitions into a map
 * for referencing them later on
 */

Devices.prototype.loadRawDevices = function() {
	var _ret = {};
	var _dir = __dirname + '/devices/concrete/';
	var _files = fs.readdirSync(_dir);
	_files.forEach(function (filename) {
		var _tmpFilename = filename.replace('.js', '');
		_ret[_tmpFilename] = require(_dir + _tmpFilename);
	});

	return _ret;
};

/**
 * Emits an 'internal' event with the command as a buffer and the raw
 * text that should be send to the usb or the lan adapter
 *
 * @param {Buffer} buffer Buffer containing the command
 *
 */

Devices.prototype.send = function(buffer, text) {
	this.emit('internal.sendCommand', buffer, text);
};

/**
 * Parses the hmID (device specific uniqueId) from
 * an incoming response
 */

Devices.prototype.parseHmId = function(data) {
	var _msgType = data[0];
	var msg = data.split(',');

	// if message type === 'E' -> Event
	var _hmId = msg[0].substr(1);

	// if message type === 'R' -> Response
	if (_msgType === 'R') {
		_hmId = msg[5].substr(6, 6);

		// If we query a state, the position of the hmId is slightly different
		// The good thing is, it switched positions with the owner, so we can just swap the char positions
		if (_hmId == this.owner) {
			_hmId = msg[5].substr(12, 6);
		}

	}

	return _hmId;
};

module.exports = Devices;