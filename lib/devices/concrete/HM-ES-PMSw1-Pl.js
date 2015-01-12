'use strict';

var Plug = require('../abstract/Plug');

var HMESPMSSw1Pl = function (options, devices) {
	this.counter = 0;
	this.status = {state: -1, pwr: undefined};
	Plug.prototype.constructor.bind(this)(options, devices);
};

HMESPMSSw1Pl.prototype = Object.create(Plug.prototype);

HMESPMSSw1Pl.prototype.current = undefined;

HMESPMSSw1Pl.prototype.parse = function(data, emit) {
	var parse = this.getParser(data, Plug);
	var ret = parse(data);

	// Check if the power consumption or the state changes
	// "80" === Consuption changed, "06" state changed 
	var _action = ret.payload.substr(18, 2) === '80' ? 'pwr' : 'state';

	if (_action === 'pwr') {

	}

	if (_action === 'state') {
		
	}

	// add action type
	ret.action = _action;

	// clean up
	delete ret.payload;
	delete ret.meta;
	delete ret.status;

	console.log(this.status);

	// emit the device.event
	emit(ret.type, ret);	
	return ret;
};

HMESPMSSw1Pl.model = '00AC';

module.exports = HMESPMSSw1Pl;

// 08845F 24A0E3000000 800009 000 6D800
// 078410 24A0E3000000 0601C8 000 01600

// 09845F 24A0E3000000 80000D 000 01700
// 0A8410 24A0E3000000 060100 000 01700

// 03845E 24A0E3000000 800013 000 6BB00
// 0E8410 24A0E3000000 060100 000 01700

// 11845F 24A0E3000000 800046 000 01900
// 128410 24A0E3000000 060100 000 01900

// 0C845E 24A0E3000000 800046 000 01900