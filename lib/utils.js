var Utils = {};

Utils.getDateTime = function () {
	return (Date.now() % parseInt("0xffffffffl")).toString(16).toUpperCase();
};

Utils.getFormattedCounter = function (counter) {
	console.log('c', counter);
	var formattedCounter = '';
	counter = counter + '';
	if (counter.length === 1) {
		formattedCounter = '0' + counter;
	}
	return formattedCounter;
};

module.exports = Utils;