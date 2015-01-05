'use strict';

var AbstractDevice = require('./AbstractDevice');

var Switch = function (options) {
	AbstractDevice.prototype.constructor.bind(this)(options);
};

Switch.prototype = Object.create(AbstractDevice.prototype);

Switch.prototype.parseDeviceEvent = function(event) {
	event = this.parseButton(event);
	return event;
};

Switch.prototype.parseButton = function(event) {
	var buttons = {42: 'up', 41: 'down', 2: 'up', 1: 'down'};
	var states = {42: true, 41: true, 2: false, 1: false};
	var _tmp = parseInt(event.payload.substring(18, 20), 10);
  event.button = buttons[_tmp];
  event.longpress = states[_tmp]
	return event;
};

module.exports = Switch;