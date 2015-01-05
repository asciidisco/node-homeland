var Homematic = require('../index');

var hm = new Homematic();

hm.on('ready', function (usb) {
	console.log('USB Connection ready!');
	usb.device.on('data', function (data) {
		//console.log(data.toString('hex'));
	});
	setTimeout(function () {
		var buf = new Buffer('9B36F4360000000000019B36F43604A01142424217688C0201C80000', 'hex');
		var buf2 = new Buffer('S', 'ascii');
		var buf3 = Buffer.concat([buf2, buf], 'hex');
		//var buf2 = new Buffer('BBB', 'ascii');
		//var buf3 = new Buffer(Buffer.concat([buf, buf2]), 'hex');
		//var buf3 = Buffer.concat([buf, buf2]);
		console.log(buf3);
		try {
			usb.device.write(buf3);
		} catch (e) {
			console.log(e);
		}
	}, 1000);

	//var buf = new Buffer('K', 'ascii');
	
	//console.log(buf);
	/*try {
		usb.device.write(buf);
	} catch (e) {
		console.log(usb.device);
	}*/
});

hm.on('device.add', function (data) {
	console.log('device.add', data);
});

hm.on('device.event', function (data) {
	console.log('device.event', data);
});

hm.connect().then(function (hm) {
	hm.addDevice('1ED6D0', 'HM-PB-2-WM55');
	hm.addDevice('17688C', 'HM-LC-Sw1-Pl');
});