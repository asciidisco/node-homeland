'use strict';

/*
 * HM-TC-IT-WM-W-EU Temperature/Humidity Sensor & Temperature Actuator
 * Note: Behaves like the HM-CC-TC
 * 
 *
 * Notification-Payload = B4865A26047600000094DC2A
 *
 * B4865A260476000000 94DC 2A => 18,5°C SetTemp =>  22°C Temp, 42%
 *                    ---- --
 *                      A   B
 * Selected Temperature = ((A >> 10) & 0x3f) / 2.0
 * Current Temperature  = ((A & 0x3ff) / 10.0
 * Current Humidity     = B
 *
 */

var HMCCTC = require('./HM-CC-TC');
var HMTCITWMWEU = Object.create(HMCCTC);
HMTCITWMWEU.model = '00AD';
module.exports = HMTCITWMWEU;