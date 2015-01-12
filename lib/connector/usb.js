'use strict';

var HID = require('node-hid');
var EventEmitter = require('events').EventEmitter;
var Q = require('q');

var USB = function (options) {
	// eq-3 USB vendor id & USB stick product id
	this.vendorId = 6943;
	this.productId = 49167;

	// check for a connected USB device and init
	this.device = null;
	this.meta = null;

	// set data listener for binding to usb data events
	this._listener = this._onData.bind(this);

	// transformation information for incoming data
	this.transformations = {
		R: [
			{length: 3, format: 'hex'}, 
			{length: 2, format: 'hex', commaBefore: true}, 
			{length: 4, format: 'hex', commaBefore: true}, 
			{length: 1, format: 'hex', commaBefore: true}, 
			{length: 2, format: 'hex', commaBefore: true}, 
			{length: 0, format: 'hex', commaBefore: true, lengthByte: true}			
		],
		H: [
			{length: 10, format: 'ascii', lengthByte: true},
			{length: 3, format: 'hex', commaBefore: true},
			{length: 10, format: 'ascii', commaBefore: true},
			{length: 0, format: 'hex', commaBefore: true}
		],
		E: [
			{length: 3, format: 'hex'}, 
			{length: 2, format: 'hex', commaBefore: true}, 
			{length: 4, format: 'hex', commaBefore: true}, 
			{length: 1, format: 'hex', commaBefore: true}, 
			{length: 2, format: 'hex', commaBefore: true}, 
			{length: 0, format: 'hex', commaBefore: true, lengthByte: true}
		]
	};
};

/**
 * import event emitter
 */

USB.prototype = Object.create(EventEmitter.prototype);

/**
 *
 */

USB.prototype._discover = function() {
	var deferred = Q.defer();
	var devices = HID.devices();
	var hmDevice = null;

	devices.forEach(function (device, idx) {
		if (device.vendorId === this.vendorId && device.productId === this.productId) {
			hmDevice = device;
			deferred.resolve(hmDevice);
		}
	}.bind(this));

	if (!hmDevice) {
		deferred.reject(this._deviceNotFound());
	}

	return deferred.promise;
};

/**
 *
 */

USB.prototype._deviceNotFound = function() {
	return new Error('No USB Device found');
};

/**
 *
 */

USB.prototype.setOwner = function(owner) {
	var commandBuf = new Buffer('A', 'ascii');
	var hexBuf = new Buffer(owner+'', 'hex');
	var buf = Buffer.concat([commandBuf, hexBuf]);
	var deferred = Q.defer();
	
	if (this.owner+'' === owner+'') {
		deferred.resolve();
	} else {
		this.send(buf);
		deferred.resolve();
	}
	return deferred.promise;	
};

/**
 *
 */

USB.prototype.reboot = function() {
	var deferred = Q.defer();
	this.send(new Buffer('A', 'ascii'));
	deferred.resolve();
	return deferred.promise;	
};

/**
 *
 */

USB.prototype.send = function(buf) {
	var deferred = Q.defer();
	this.device.write(buf);
	deferred.resolve();
	return deferred.promise;	
};

/**
 *
 */

USB.prototype.setDevice = function(device) {
	var deferred = Q.defer();
	this.meta = device;
	this.device = new HID.HID(device.path);
	deferred.resolve();
	return deferred.promise;	
};

/**
 *
 */

USB.prototype.connect = function() {
	var deferred = Q.defer();
	this._discover().then(function (device) {
		this.setDevice(device).then(function () {
				this.identify().then(function () {
					this.emit('ready', this);
					this.device.on('data', this._listener);
					deferred.resolve();
			}.bind(this));
		}.bind(this));
	}.bind(this)).catch(deferred.reject);
	return deferred.promise;
};

/**
 *
 */

USB.prototype.identify = function() {
	var deferred = Q.defer();
	this.device.on('data', function (buf) {
		var data = this._convertData(buf);
		if (data.substr(0, 10) === 'HHM-USB-IF') {
			var identity = this._parseIdentity(data);
			deferred.resolve(identity);
		}
	}.bind(this));	
	this.send(new Buffer('K', 'ascii'));
	return deferred.promise;
};

/**
 *
 */

USB.prototype._parseIdentity = function(data) {
	this.name = data.substr(0, 10);
	this.version = parseInt(data.substr(12, 4), 16);
	this.serialNo = data.substr(19, 10);
	this.owner = data.substr(36, 6);
	return {name: this.name, version: this.version, serialNo: this.serialNo, owner: this.owner};
};

/**
 *
 */

USB.prototype._onData = function(buf) {
	this.emit('data', this._convertData(buf));
};

/**
 *
 */

USB.prototype._convertData = function(buf) {
	return this._format(buf.slice(0, 1).toString('ascii'), buf, this.transformations);
};

/**
 *
 */

USB.prototype._bin2hex = function(buf) {
	var hexbuf = new Buffer(buf.length * 2);
	var nibble = function (b) {
		if (b <= 0x09) return 0x30 + b;
		return 0x41 + (b - 10);
	}

	for(var i=0; i < buf.length; i++) {
  	hexbuf[i*2] = nibble(buf[i] >> 4);
  	hexbuf[i*2+1] = nibble(buf[i] & 0x0F);
	}

	return hexbuf.toString('ascii', 0, hexbuf.length);
};

/**
 *
 */

USB.prototype._format = function(type, buf, transformations) {
	var ret = type;
	var start = 1;

	if (!transformations[type]) {
		return buf;
	}

	transformations[type].forEach(function (options) {
		var _start = start;
		var _length = options.length;
		
		if (options.commaBefore === true) {
			ret += ',';
		}
		
		if (options.lengthByte === true) {
			_start = start + 1;
		}
		
		_length = options.length === 0 ? buf.length : _start + options.length; 
		
		if (options.format === 'ascii') {
			ret += buf.slice(_start, _length).toString('ascii');
		} else {
			ret += this._bin2hex(buf.slice(_start, _length));	
		}

		start = start + options.length;
	}.bind(this));

	return ret;
};

module.exports = USB;