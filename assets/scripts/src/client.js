/*
client.js

author: @chielkunkels
*/'use strict';
log('client.js');

var events = require('./events');
require('./tinker');
require('./layout/client');

window.Tinker = {
	init: function() {
		events.publish('init');
	}
};

