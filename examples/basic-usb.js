var Homematic = require('../index');

var hm = new Homematic();

hm.on('ready', function (usb) {
	//console.log('USB Connection ready!');
	/*usb.device.on('data', function () {
		console.log(arguments);
	});*/
});

var devices = {};
hm.on('device.add', function (device) {
	console.log('device.add', device);
	devices[device.hmId] = device;
});

hm.on('device.event', function (data) {
	console.log('device.event', data);
});

hm.connect().then(function (hm) {
	hm.setOwner(424242).then(function () {
		hm.addDevice('1ED6D0', 'HM-PB-2-WM55');
		hm.addDevice('17688C', 'HM-LC-Sw1-Pl');
	});
});

/*setTimeout(function () {
	devices['17688C'].off();
	setTimeout(function () {
		devices['17688C'].on();
		setTimeout(function () {
			devices['17688C'].off();
			setTimeout(function () {
				devices['17688C'].on();
			}, 2000);	
		}, 2000);	
	}, 2000);
}, 2000);*/