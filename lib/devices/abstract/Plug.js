'use strict';

var Q = require('q');
var Utils = require('../../utils');
var AbstractDevice = require('./AbstractDevice');

/**
 * 
 */

var Plug = function (options, devices) {
	AbstractDevice.prototype.constructor.bind(this)(options, devices);
};

/**
 * 
 */

Plug.prototype = Object.create(AbstractDevice.prototype);

/**
 * 
 */

Plug.prototype.lastCommand = {
	command: null,
	deffered: null,
	state: -1
};

/**
 * 
 */

Plug.prototype.state = undefined;

/**
 * 
 */

Plug.prototype.parseDeviceEvent = function(event) {
	event = this.parseState(event);
	return event;
};

/**
 * 
 */

// Incoming Data (on):  0E 01 A0 01 424242 17688C 02 01 00 00 00 30 33 37 39 37 39 34 10 01 02
// Incoming Data (off): 0E 01 A0 01 424242 17688C 02 01 00 00 00 42 00 2E DA 6E 00 00 10 01 02
// Incoming Data (on):  0E 01 A0 01 424242 17688C 02 01 00 00 00 30 33 37 39 37 39 34 10 01 02
// Incoming Data (off): 0E 01 80 02 17688C 424242 01 01 00 00 2D 42 00 04 78 25 00 00 00 00 00
Plug.prototype.parseDeviceResponse = function(event) {
  var _parsed = this.parseState(event);
	return _parsed;
};

/**
 * 
 */

Plug.prototype.parseState = function(event) {
  var raw;
  var states = {'C8': 'on', '00': 'off'};
  var _raw = event.payload.substring(22, 24);
  event.state = states[_raw];

  // if state is undefined (this is the case when dealing with a response instead of an event),
  // try to get the value from a different char pos in the payload
  if (!event.state) {
    raw = event.payload.substring(24, 26);
    event.state = states[_raw];
  }

	return event;
};

/**
 * 
 */

Plug.prototype.off = function () {
  this.lastCommand.deferred = Q.defer();

 	var time = Utils.getDateTime();
	this.counter++;
	this.counter %= 255;
	var counter = Utils.getFormattedCounter(this.counter);
	var command = 'S' + time + ',00,00000000,01,' + time + ',' + counter + 'A011' + this.owner + this.hmId + '0201000000';
	this.send(command);

	return this.lastCommand.deferred.promise;
};

/**
 * 
 */

Plug.prototype.on = function () {
	this.lastCommand.deferred = Q.defer();

	var time = Utils.getDateTime();
	this.counter++;
	this.counter %= 255;
	var counter = Utils.getFormattedCounter(this.counter);
	var command = 'S' + time + ',00,00000000,01,' + time + ',' + counter + 'A011' + this.owner + this.hmId + '0201C80000';
	this.send(command);

	return this.lastCommand.deferred.promise;	
};

/**
 * 
 */

Plug.prototype.toggle = function() {
};

/**
 * 
 */

Plug.prototype.queryState = function () {
  this.lastCommand.deferred = Q.defer();

 	var time = Utils.getDateTime();
	this.counter++;
	this.counter %= 255;
	var counter = Utils.getFormattedCounter(this.counter);
	
	var command = 'S' + time + ',00,00000000,01,' + time + ',' + counter + 'A001' + this.owner + this.hmId + '020E';
	this.send(command);
  console.log('queryState', command);
	return this.lastCommand.deferred.promise;	
};

module.exports = Plug;