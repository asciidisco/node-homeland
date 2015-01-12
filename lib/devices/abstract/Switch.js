'use strict';

var AbstractDevice = require('./AbstractDevice');

var Switch = function (options, devices) {
	AbstractDevice.prototype.constructor.bind(this)(options, devices);
};

Switch.prototype = Object.create(AbstractDevice.prototype);

Switch.prototype.parseDeviceEvent = function(event) {
	event = this.parseButton(event);
	return event;
};

Switch.prototype.parseButton = function(event) {
	var _tmp = parseInt(event.payload.substring(18, 20), 10);
  	event.button = (_tmp.toString().length === 2) ? parseInt(_tmp.toString()[1], 10) : _tmp;
  	event.longpress = (_tmp.toString().length === 2 && _tmp.toString()[0] === '4')
	return event;
};

module.exports = Switch;