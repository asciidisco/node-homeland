'use strict';

var Q = require('q');
var Utils = require('../../utils');
var AbstractDevice = require('./AbstractDevice');

var Plug = function (options, connector) {
	AbstractDevice.prototype.constructor.bind(this)(options, connector);
};

Plug.prototype = Object.create(AbstractDevice.prototype);

Plug.prototype.parseDeviceEvent = function(event) {
	event = this.parseState(event);
	return event;
};

Plug.prototype.parseState = function(event) {
	var states = {'C8': 'on', '00': 'off'};
  var _raw = event.payload.substring(22, 24);
  event.state = states[_raw];
	return event;
};

Plug.prototype.off = function () {
 	var time = Utils.getDateTime();
	this.counter++;
	this.counter %= 255;
	var counter = Utils.getFormattedCounter(this.counter);
	var command = 'S' + time + ',00,00000000,01,' + time + ',' + counter + 'A011' + this.owner + this.hmId + '0201000000';
	this.send(command);
};

Plug.prototype.on = function () {
 	var time = Utils.getDateTime();
	this.counter++;
	this.counter %= 255;
	var counter = Utils.getFormattedCounter(this.counter);
	var command = 'S' + time + ',00,00000000,01,' + time + ',' + counter + 'A011' + this.owner + this.hmId + '0201C80000';
	this.send(command);
};

Plug.prototype.toggle = function() {
};

Plug.prototype.queryState = function () {
 	var time = Utils.getDateTime();
	this.counter++;
	this.counter %= 255;
	var counter = Utils.getFormattedCounter(this.counter);
	var command = 'S' + time + ',00,00000000,01,' + time + ',' + counter + 'A001' + this.owner + this.hmId + '01012X0E';
	this.send(command);
};

module.exports = Plug;