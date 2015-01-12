'use strict';

var Utils = {};

/**
 * Returns a hexadecimal datetime object
 * that can be used when sending commands
 */

Utils.getDateTime = function () {
	return (Date.now() % parseInt("0xffffffffl", 10)).toString(16).toUpperCase();
};

/**
 * Returns a command counter (as a string)
 */

Utils.getFormattedCounter = function (counter) {
	var formattedCounter = '';
	counter = counter + '';
	if (counter.length === 1) {
		formattedCounter = '0' + counter;
	}
	return formattedCounter;
};

/**
 * Returns a command counter
 * that can be used when sending commands
 */

Utils.getFormattedCounterAsHex = function (counter) {
	var formattedCounter = Utils.getFormattedCounter(counter);
	var hexCounter = parseInt(formattedCounter, 10).toString(16);
	if (hexCounter.length === 1) {
		hexCounter = '0' + hexCounter;
	}
	return hexCounter;
};

/**
 * Parses the RSSI (Received Signal Strength Indication)
 * 
 */

Utils.parseRSSI = function(hex) {
	return parseInt(hex, 16) - 65536;
};

/**
 * Parses the Uptime (Time the device is connected to the current coordinator)
 * 
 */

Utils.parseUptime = function(hex) {
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

Utils.parseMessageCount = function(data) {
	var msgCount = 0;

	return msgCount;
};

Utils.parseFirmwareVersion = function(hex) {
	return parseInt(hex[0], 10) + '.' + parseInt(hex[1], 10);
};

/**
 * Converts hex to ascii
 * 
 */

Utils.convertHexToAscii = function(hexx) {
	//force conversion
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return str;
};

/**
 * Converts a command string to a sendable node buffer
 * that can be send via USB
 */

Utils.convertCommandToBuffer = function (command) {
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
	return buf;
};

Utils.convertModelIdToModel = function (modelMap, modelId) {
	var modelType;

	Object.keys(modelMap).forEach(function (model) {
		if (modelMap[model].model === modelId) {
			modelType = model;
		}
	});

	return modelType;
};

module.exports = Utils;