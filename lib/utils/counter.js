'use strict';

var counterInstance = null;

var Counter = function (startWith) {
	this.counter = startWith || 0;
	this.countBig = startWith || 0;
};

Counter.prototype.increment = function () {
	this.counter++;
	this.countBig++;
	this.counter %= 255;
	return this.counter;
};

Counter.prototype.getCounter = function () {
	return this.counter;
};

Counter.prototype.getBigCounter = function () {
	return this.countBig;
};

module.exports = function (startWith) {
	if (counterInstance === null) {
		counterInstance = new Counter(startWith);
	}

	return counterInstance;
};