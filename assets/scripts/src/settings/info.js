/*
settings/info.js

author: @chielkunkels
*/'use strict';
log('settings/info.js');

var events = require('../events');
var tinker = require('../tinker');
var settings = require('./main');

//
var build = function(){
	log('settings.info.build();');

	var html = '<ul>'+
		'<li><label for="input-title">Title</label><input id="input-title" name="title" value="'+(tinker.title || '')+'"></li>'+
		'<li><label for="input-description">Description</label><textarea id="input-description" name="description">'+(tinker.description || '')+'</textarea></li>'+
		'</ul>';
	var fieldset = new Element('fieldset.settings-info', {html: html});

	settings.addSection('Info', fieldset);
};

events.subscribe('settings.build', build);
