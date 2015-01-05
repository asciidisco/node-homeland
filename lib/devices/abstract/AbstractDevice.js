'use strict';

var AbstractDevice = function (options, connector) {
	this.owner = options.owner;
	this.hmId = options.hmId;
	this.model = options.model;

	this.connector = connector;

	// set a listener on data events (so we can parse responses)
	var _listener = this._listenOnConnectorData.bind(this);
	this.connector.on('data', _listener);
};

/**
 * Parses the RSSI (Received Signal Strength Indication)
 * 
 */

AbstractDevice.prototype.parseRSSI = function(hex) {
	return parseInt(hex, 16) - 65536;
};

/**
 * Parses the Uptime (Time the device is connected to the current coordinator)
 * 
 */

AbstractDevice.prototype.parseUptime = function(hex) {
	var hmtC = parseInt(hex, 16);	
	var sec = parseInt(hmtC/1000, 10);
	var uptime = {
		d: parseInt((hmtC / 86400000).toFixed(), 10),
  	h: parseInt(parseInt(sec / 3600, 10).toFixed(), 10),
  	m: parseInt(((sec % 3600) / 60).toFixed(), 10),
		s: parseInt((sec % 60).toFixed(), 10),
		ms: (hmtC % 1000)
	};
	return uptime;
};

/**
 * Parses the amount of message that have been send by the
 * coordinator to the device (From 0 to 255, then starts again at 0)
 * 
 */

AbstractDevice.prototype.parseMessageCount = function(data) {
	var msgCount = 0;

	return msgCount;
};

AbstractDevice.prototype.parse = function(event) {
	event.rssi = this.parseRSSI(event.rssi);
	event.uptime = this.parseUptime(event.uptime);
	return event;
};

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
  
  event.model = this.model;
  if (this.owner) {
  	event.owner = this.owner;
  }
  
  return event;
};

AbstractDevice.prototype.send = function (command) {
	var zeroCount = 0; 
	var _tmp = command.split('');
	var commandBuf = new Buffer(_tmp.shift(), 'ascii');
	var _tmp2 = [];
	_tmp.forEach(function (item, idx) {
		var processed = false;
		var data = (item !== ',' ? item.toString(16) : undefined);

		if (item == ',' && zeroCount < 2) {
			zeroCount++;
			processed = true;
		}

		if (item == ',' && zeroCount > 2) {
			zeroCount = 0;
			_tmp2[(_tmp2.length)-3] = '01';
			processed = true;
		}

		if (idx === 32) {
			_tmp2.push('0e');
		}

		if (!processed) {
			_tmp2.push(data);
		}

	}.bind(this));
	var hexBuf = new Buffer(_tmp2.join('').replace(',', ''), 'hex');
	var buf = Buffer.concat([commandBuf, hexBuf]);
	this.connector.send(buf);
};

AbstractDevice.prototype.getParser = function(buf, Middleware) {
	var parserMap = {
		'E': 'parseDeviceEvent'
	};

	return function (data) {
		data = AbstractDevice.prototype[parserMap[buf.substr(0, 1)]].bind(this)(data);
		data = Middleware.prototype[parserMap[buf.substr(0, 1)]].bind(this)(data);
		return data;
	}.bind(this)
};

module.exports = AbstractDevice;