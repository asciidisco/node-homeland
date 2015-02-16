'use strict';

var Q = require('q');
var Utils = require('./utils');

/**
 * 
 */

var Pairing = function (connector, devices, ee) {
	// external dependencies
	this.connector = connector;
	this.devices = devices;
	this.ee = ee;

	// pairing flags
	this.pairingActive = false;
	this.pairingInProgress = false;
	this.pairingModePromise = null;
	this.pairingTimer = null;
	this.currentDevice = {};
	this.responseCounter = 0;
	this.deviceInformation = {};

	// list of paired devices during the pairing session
	this.pairedDevices = [];
};

Pairing.prototype.startPairingFlow = function(data) {
	console.log('startPairingFlow');
	// start the pairing flow
	this.pairingInProgress = true;
	var event = this.parsePairingEvent(data);
	var deviceInformation = this._onPairingEvent(event);
	this.deviceInformation = deviceInformation;

	// send pairing challange to the device
	setImmediate(this.sendFirstPairingRequest.bind(this, deviceInformation.hmId, this.devices.owner));
};

Pairing.prototype.isValidPairingRequest = function(data) {
	// split up data, we are only interested in the payload
	// so that we can verify if this is a pairing request
	var _data = data.split(',');
	var payload = _data[5];
	// check if the length of the payload roughly fits the requirements 
	var hasValidLength = (parseInt(payload.substr(42), 10) > 0);
	// check if the model is known
	var modelId = Utils.convertModelIdToModel(this.devices.rawDevices, payload.substring(20, 24));
	var includesKnownModel = !!modelId;
	return hasValidLength && includesKnownModel;
};

Pairing.prototype.isCurrentDeviceRequest = function(data) {
	// split up data, we are only interested in the payload
	// so that we can verify if this is a request from the current paired device
	var _data = data.split(',');
	var payload = _data[5];
	// parse out the hmId 
	var _hmId = payload.substring(6, 12);
	// check if the device is the one we are pairing right now
	var isCurrentDeviceRequest = this.deviceInformation.hmId === _hmId;

	// another pairing request can have a different char position for the
	// device information, so we need to test for this as well
	if (!isCurrentDeviceRequest) {
		_hmId = payload.substring(14, 20);
		isCurrentDeviceRequest = this.deviceInformation.hmId === _hmId;
	}

	return isCurrentDeviceRequest;
};

Pairing.prototype.processPairingData = function(data) {
	if (this.responseCounter === 2 && this.pairingInProgress) {
		this._onThirdPairingResponse(data);
	}		

	if (this.responseCounter === 1 && this.pairingInProgress) {
		this._onSecondPairingResponse(data);
	}

	if (this.responseCounter === 0 && this.pairingInProgress) {
		this._onFirstPairingResponse(data);
	}
};

/**
 * 
 */

Pairing.prototype.startPairing = function(sec, cb) {
	// create callback
	var _cb = typeof cb === 'function' ? cb : function () {};

	// activate the pairingMode
	this.pairingModePromise = Q.defer();
	this.pairingActive = true;
	// start the timer
	this.pairingTimer = setTimeout(this._killMode.bind(this, _cb), (sec * 1000));

	return this.pairingModePromise.promise;
};

/**
 * 
 */

Pairing.prototype.stopPairing = function() {
	// store local devices before they get killed
	var _pairedDevices = this.pairedDevices;
	// kill the pairing mode
	this._killMode(function(){});
	return _pairedDevices;
};

/**
 * 
 */

Pairing.prototype._killMode = function(cb) {
	// resolve the pairing mode promise
	this.pairingModePromise.resolve(this.pairedDevices);
	cb(null, this.pairedDevices);
	// deactivate the pairing mode
	this.pairingActive = false;
	// kill any active hanging pairing process
	this.pairingInProgress = false;
	// reset response counter
	this.responseCounter = 0;
	// kill the timer
	clearTimeout(this.pairingTimer);
	// reset paired devices
	this.pairedDevices = [];
};

Pairing.prototype.isPairingModeActive = function () {
	return this.pairingActive;
};

Pairing.prototype.parsePairingEvent = function(data) {
	var event = {};
	var raw = data.split(',');
	event.type = 'device.event';
	event.hmId = raw[0].substring(1);
	event.status = raw[1];
	event.uptime = raw[2];
	event.meta = raw[3];
	event.rssi = raw[4];
	event.payload = raw[5].replace('\r\n', '');
	return event;
};


// E 1936D6, 0000, 0073 F4 37, FF, FFD8, 02 8400 1936D6 000000 21 0039 4A455130303434333035 58 00 FF FF
//   ------  ----  ---- -- --  --  ----  -- ---- ------ ------ -- ---- -------------------- -- -- -- --
//   HMId    ????  ???? BC ??  ??  RSSI  ?? ???? HMId   ?????? FW TYPE SERIALNUMBER         NO ?? ?? ??

Pairing.prototype._onPairingEvent = function(event) {
	var deviceInformation = {};
	// add hmId
	deviceInformation.hmId = event.hmId;
	// add rssi
	deviceInformation.rssi = Utils.parseRSSI(event.rssi);
	// add model
	deviceInformation.model = Utils.convertModelIdToModel(this.devices.rawDevices, event.payload.substring(20, 24));
	// add firmware version
	deviceInformation.firmware = Utils.parseFirmwareVersion(event.payload.substring(18, 20));
	// add serial number               
	deviceInformation.serialNo = Utils.convertHexToAscii(event.payload.substring(24, 44));
	// add owner
	deviceInformation.owner = this.devices.owner;

	// set the pairing in process flag
	this.pairingInProgress = true;

	// set current device
	this.currentDevice = deviceInformation;

	// emit start pairing
	this.ee.emit('pairing.started', deviceInformation);

	// send initial device add
	this.sendInitialDeviceAdd(deviceInformation.hmId);

	return deviceInformation;
};

// R CAB2CB8B, 0001, 0073 F5 73, FF, FFD8, 0E 80 02 1936D6 424242 00
//   --------  ----  ---- -- --  --  ----  -- -- -- ------ ------ --
//   TIMESTMP  ????  ???? BC ??  ??  RSSI  CM ?? ?? HMId   OWNER  ??
Pairing.prototype._onFirstPairingResponse = function(data) {
	this.responseCounter++;
	this.sendSecondPairingRequest(this.deviceInformation.hmId, this.devices.owner);
};

// R CAB2CC9E, 0001, 0073 F7 04, FF, FFD7, 0F 80 02 1936D6 424242 00
//   --------  ----  ---- -- --  --  ----  -- -- -- ------ ------ --
//   TIMESTMP  ????  ???? BC ??  ??  RSSI  CM ?? ?? HMId   OWNER  ??
Pairing.prototype._onSecondPairingResponse = function() {
	this.responseCounter++;
	this.sendThirdPairingRequest(this.deviceInformation.hmId, this.devices.owner);
};

// R CAB2CDF1, 0001, 0073 F8 95, FF, FFD7, 10 80 02 1936D6 424242 00
//   --------  ----  ---- -- --  --  ----  -- -- -- ------ ------ --
//   TIMESTMP  ????  ???? BC ??  ??  RSSI  CM ?? ?? HMId   OWNER  ??
Pairing.prototype._onThirdPairingResponse = function() {
	var device = this.deviceInformation;
	this.responseCounter++;

	// reset device data
	this.pairingInProgress = false;
	this.currentDevice = {};
	this.responseCounter = 0;
	this.deviceInformation = {};

	// emit the pairing done event
	this.ee.emit('device.paired', device);
};

// +1936D6,00,00,
Pairing.prototype.sendInitialDeviceAdd = function(hmId) {
	var cmd = '+' + hmId + ',00,00,';

	// send command
	this.connector.send(Utils.convertCommandToBuffer(cmd), cmd);
	return this;
};

// S CAB2CB8B, 00, 00000000, 01, CAB2CB8B, 0E A0 01 424242 1936D6 00 05 0000000000
//   --------  --  --------  --  --------  -- -- -- ------ ------ -- -- ----------
//   TIMESTMP  ??  ??????    ??  TIMESTMP  CM ?? ?? OWNER  HMId   ?? ?? ??
Pairing.prototype.sendFirstPairingRequest = function(hmId, owner) {
	// command template
	var cmd = 'S{{timestamp}},00,00000000,01,{{timestamp}},{{counter}}A001{{owner}}{{hmId}}00050000000000';

	// get current timestamp and counter
	var timestamp = Utils.getDateTime();
	var counter = Utils.getFormattedCounterAsHex();
	
	// replace template variables
	cmd = cmd.replace('{{timestamp}}', timestamp).replace('{{timestamp}}', timestamp);
	cmd = cmd.replace('{{counter}}', counter);
	cmd = cmd.replace('{{owner}}', owner);
	cmd = cmd.replace('{{hmId}}', hmId);

	// send command
	var buf = Utils.convertCommandToBuffer(cmd);
	// set the length byte
	//buf.writeInt8(16, 15);

	this.connector.send(buf, cmd);

	return this;
};

// S CAB2CC9E, 00, 00000000, 01, CAB2CC9E, 0F A0 01 424242 1936D6 00 08 02 01 0A42 0B42 0C42
//   --------  --  --------  --  --------  -- -- -- ------ ------ -- -- -- -- ---- ---- ----
//   TIMESTMP  ??  ????????  ??  TIMESTMP  CM ?? ?? OWNER  HMId   ?? ?? ?? ?? OWN1 OWN2 OWN3
Pairing.prototype.sendSecondPairingRequest = function(hmId, owner) {
	// command template
	var cmd = 'S{{timestamp}},00,00000000,01,{{timestamp}},{{counter}}A001{{owner}}{{hmId}}000802010A{{own1}}0B{{own2}}0C{{own3}}';

	// get current timestamp and counter
	var timestamp = Utils.getDateTime();
	var counter = Utils.getFormattedCounterAsHex();
	var ownerParts = (owner+'').split('');

	// replace template variables
	cmd = cmd.replace('{{timestamp}}', timestamp).replace('{{timestamp}}', timestamp);
	cmd = cmd.replace('{{counter}}', counter);
	cmd = cmd.replace('{{owner}}', owner);
	cmd = cmd.replace('{{hmId}}', hmId);
	cmd = cmd.replace('{{own1}}', ownerParts[0] + ownerParts[1]).replace('{{own2}}', ownerParts[2] + ownerParts[3]).replace('{{own3}}', ownerParts[4] + ownerParts[5]);

	// send command
	var buf = Utils.convertCommandToBuffer(cmd);
	// set the length byte
	//buf.writeInt8(16, 15);

	this.connector.send(buf, cmd);
	return this;
};

// S CAB2CDF1, 00, 00000000, 01, CAB2CDF1, 10 A0 01 424242 1936D6 00 06
//   --------  --  --------  --  --------  -- -- -- ------ ------ -- --
//   TIMESTMP  ??  ????????  ??  TIMESTMP  CM ?? ?? OWNER  HMId   ?? ??
Pairing.prototype.sendThirdPairingRequest = function(hmId, owner) {
	// command template
	var cmd = 'S{{timestamp}},00,00000000,01,{{timestamp}},{{counter}}A001{{owner}}{{hmId}}0006';

	// get current timestamp and counter
	var timestamp = Utils.getDateTime();
	var counter = Utils.getFormattedCounterAsHex();

	// replace template variables
	cmd = cmd.replace('{{timestamp}}', timestamp).replace('{{timestamp}}', timestamp);
	cmd = cmd.replace('{{counter}}', counter);
	cmd = cmd.replace('{{owner}}', owner);
	cmd = cmd.replace('{{hmId}}', hmId);

	// send command
	var buf = Utils.convertCommandToBuffer(cmd);
	// set the length byte
	//buf.writeInt8(16, 15);

	this.connector.send(buf, cmd);

	return this;
};

module.exports = Pairing;