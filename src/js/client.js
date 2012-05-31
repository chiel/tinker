/*
file:   client.js
author: @chielkunkels
*/'use strict';
// log('client.js');

window.Tinker = {
	init: function() {
		events.publish('init');
	}
};

require('./data');
require('./modules/user/model');
var urls = require('./urls');
var events = require('./events');
var layout = require('./layout/client');
var Popover = require('./popover');

var build = function(){
	layout.addToRegion(new Element('h1.logo', {html: '<a href="'+urls.client+'"></a>'}), 'tm');
	var aboutButton = new Element('a.about[href=#about][text=About]');
	layout.addToRegion(aboutButton, 'br');

	var html = '<p><strong>Tinker</strong> is a quick and easy tool for writing and sharing code, '+
		'created by <a href="https://twitter.com/#!/chielkunkels">@chielkunkels</a> and friends.</p>'+
		'<p>Tinker is open source, so <a href="http://git.io/tinker">check it out on Github</a>.</p>'+
		'<ul class="twitter-buttons">'+
		'<li class="tweet"><a href="https://twitter.com/share" class="twitter-share-button" data-url="https://tinker.io">Tweet</a></li>'+
		'<li class="follow"><a href="https://twitter.com/tinker_io" class="twitter-follow-button" data-show-count="false">Follow @tinker_io</a></li>'+
		'</div>';

	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

	var contents = new Element('p', {text: 'sup'});
	var popover = new Popover(new Element('div', {html: html}), {button: aboutButton, anchor: 'br'});
	popover.element.addClass('po-about');
};

events.subscribe('layout.build', build);

