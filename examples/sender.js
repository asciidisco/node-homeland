var Homeland = require('../index');
var hm = new Homeland();

var devices = {};

hm.on('ready', function (usb) {
	//console.log('USB Connection ready!');

	setTimeout(function () {
		devices['197B72'].off();
		setTimeout(function () {
			devices['197B72'].on();
			setTimeout(function () {
				devices['197B72'].off();
				setTimeout(function () {
					devices['197B72'].on();
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
	console.log('device.event', data);
});

hm.connect().then(function (hm) {
	hm.setOwner(424242).then(function () {
		hm.addDevice({ hmId: '197B72',
  rssi: -28,
  model: 'HM-LC-Sw1-Pl',
  firmware: '1.9',
  serialNo: 'JEQ0066046',
  owner: 424242,
  id: '197B72' });
	}).catch(function (err) {
		console.error(err);
	});
}).catch(function (err) {
	console.error(err);
});