var Homeland = require('../index');
var hm = new Homeland();

var devices = {};

hm.on('ready', function (usb) {
	console.log('USB Connection ready!');
});

hm.on('device.event', function (data) {
	console.log('device.event', data);
});

hm.on('device.paired', function (deviceMeta) {
	deviceMeta.id = deviceMeta.hmId;
	console.log('device.paired:', deviceMeta);
	devices[deviceMeta.hmId] = hm.addDevice(deviceMeta);
});

hm.on('device.added', function (device) {
	console.log('device.added:', device);
});

hm.on('broadcast', function (data) {
	console.log('broadcast', data);
});

hm.connect().then(function (hm) {
	hm.setOwner(424242).then(function () {
		console.log('pairing started');
		hm.startPairing(120).then(function () {
			console.log('Pairing mode ended');
		});
	});
}).catch(function (err) {
	console.error(err);
});