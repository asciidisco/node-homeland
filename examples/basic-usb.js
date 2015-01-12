var Homematic = require('../index');

var hm = new Homematic();

hm.on('ready', function (usb) {
	console.log('USB Connection ready!');
});

var devices = {};
hm.on('device.paired', function (device) {
	console.log('device.paired', device);
	devices[device.hmId] = device;
});

hm.on('device.add', function (device) {
	console.log('device.add', device);
	devices[device.hmId] = device;
});

hm.on('device.event', function (/*device,*/ state, changed) {
	console.log('device.event', state);
});

hm.connect().then(function (hm) {
	hm.setOwner(424242).then(function () {
		//hm.addDevice({id: '1ED6D0', model: 'HM-PB-2-WM55', serial: 'JEQ1234567'});
		//hm.addDevice({id: '17688C', model: 'HM-LC-Sw1-Pl'});
		//hm.addDevice({id: '1936D6', model: 'HM-CC-TC'});
		//hm.addDevice({id: '19A1CA', model: 'HM-Sec-SC'});
		//hm.addDevice({id: '2916DA', model: 'HM-Sec-SCo'});
		//hm.addDevice({id: '24A0E3', model: 'HM-ES-PMSw1-Pl'});
		//hm.addDevice({id: '1AC333', model: 'HM-WDS-10-TH-O'});
		//hm.addDevice({id: '1ABFD2', model: 'HM-WDS40-TH-I'});
		//hm.addDevice({id: '1FC972', model: 'HM-WDS40-TH-I-2'});
		//hm.addDevice({id: '199CD0', model: 'HM-PB-4-WM'});
		//hm.addDevice({id: '18212B', model: 'HM-RC-12-B'});
		//hm.addDevice({id: '29D2D9', model: 'HM-RC-4-2'});
		//hm.addDevice({id: '2710DF', model: 'HM-TC-IT-WM-W-EU'});
		//hm.addDevice({id: '1DF092', model: 'HM-RC-P-1'});
	});
});