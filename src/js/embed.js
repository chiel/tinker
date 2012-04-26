/*
embed.js

author: @chielkunkels
*/'use strict';
// log('embed.js');

window.Tinker = {
	init: function() {
		events.publish('init');
	},
	mode: 'embed'
};

require('./data');
var urls = require('./urls');
var events = require('./events');
var layout = require('./layout/embed');

