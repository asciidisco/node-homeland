var Homeland = require('../index');
var hm = new Homeland();

var devices = {};

hm.on('ready', function (usb) {
	console.log('USB Connection ready!');

});

hm.on('device.event', function (data) {
	console.log('device.event', data);
});

hm.connect().then(function (hm) {
	hm.setOwner(424242).then(function () {
		hm.startPairing(120).then(function () {
			console.log('Pairing mode ended');
		});
	});
}).catch(function (err) {
	console.error(err);
});