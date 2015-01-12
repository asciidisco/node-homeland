'use strict';

/*
 * HM-WDS40-TH-I Indoor Temperature/Humidity Sensor (Version 2)
 * 
 *
 * Notification-Payload = B4865A26047600000094DC2A
 *
 * B4865A260476000000 94DC 2A => 22°C Temp, 42% Humidity
 *                    ---- --
 *                      A   B
 * Current Temperature  = ((A & 0x3ff) / 10.0
 * Current Humidity     = B
 *
 */

var HMWDS40THI2 = require('./HM-WDS40-TH-I');
module.exports = HMWDS40THI2;