'use strict';

var Net = require('net');
var EventEmitter = require('events').EventEmitter;
var Q = require('q');

var Lan = function (options) {
	// set data listener for binding to net data events
	this._listener = this._onData.bind(this);
};

/**
 * import event emitter
 */

Lan.prototype = Object.create(EventEmitter.prototype);

/**
 *
 */

Lan.prototype._discover = function() {
	var deferred = Q.defer();
	deferred.resolve();
	return deferred.promise;
};

/**
 *
 */

Lan.prototype.setDevice = function(device) {
	var deferred = Q.defer();
	deferred.resolve();
	return deferred.promise;	
};

/**
 *
 */

Lan.prototype.connect = function() {
	var deferred = Q.defer();
	deferred.resolve();
	return deferred.promise;
};

/**
 *
 */

Lan.prototype._onData = function(buf) {
	this.emit('data', this._convertData(buf));
};

module.exports = Lan;