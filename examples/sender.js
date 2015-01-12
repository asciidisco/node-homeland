var Homeland = require('../index');
var hm = new Homeland();

var devices = {};

hm.on('ready', function (usb) {
	//console.log('USB Connection ready!');

	setTimeout(function () {
		//devices['17688C'].off();
		setTimeout(function () {
			devices['17688C'].on();
			setTimeout(function () {
				devices['17688C'].off();
				setTimeout(function () {
					devices['17688C'].on();
				}, 2000);	
			}, 2000);
		}, 2000);
	}, 2000);

});

hm.on('device.add', function (device) {
	console.log('device.add', device);
	devices[device.hmId] = device;
});

hm.on('device.event', function (data) {
	//console.log('device.event', data);
});

hm.connect().then(function (hm) {
	hm.setOwner(424242).then(function () {
		hm.addDevice({id: '1ED6D0', model: 'HM-PB-2-WM55'});
		hm.addDevice({id: '17688C', model: 'HM-LC-Sw1-Pl'});
	});
}).catch(function (err) {
	console.error(err);
});