/*
tinker.js

author: @chielkunkels
*/'use strict';
// log('tinker.js');

var data = JSON.parse(document.getElement('script[type=tinker]').get('html'));
var tinker = {};

var data = require('./data');
var events = require('./events');
var layout;

if (window.Tinker.mode === 'embed') {
	layout = require('./layout/embed');
} else {
	layout = require('./layout/client');
}

// rewrite the url if needed
if (data.username) {
	var url = '/'+data.username+'/'+data.hash;
	if (data.revision) {
		url += '/'+data.revision;
	}
	if (!!(window.history && history.pushState)) {
		history.pushState(null, null, url);
	} else {
		window.location = url;
	}
}

var inputHash, inputRevision, inputRevisionId, saveButton;

//
var build = function(){
	// log('tinker.build();');

	var saveLabel = data.username ? 'Fork' : 'Save',
		buttons;

	var html = '<li><a href="#run" class="btn run">Run</a></li>'+
		'<li><a href="#save" class="btn btn-default save">'+saveLabel+'</a></li>';
	layout.addToRegion(buttons = new Element('ul.buttons', {
		html: html,
		events: {
			click: function(e) {
				e.preventDefault();
				var href = e.target.get('href');
				if (href === '#run') {
					run();
				} else if (href === '#save') {
					save();
				}
			}
		}
	}), 'tr');

	saveButton = buttons.getElement('.save');

	layout.wrapper.adopt(
		inputHash = new Element('input[type=hidden]', {name: 'hash', value: data.hash}),
		inputRevision = new Element('input[type=hidden]', {name: 'revision', value: data.revision}),
		inputRevisionId = new Element('input[type=hidden]', {name: 'revision_id', value: data.revision_id})
	);
};

//
var run = function(){
	// log('tinker.run();');

	events.publish('tinker.save');
	layout.wrapper.submit();
};

//
var save = function(){
	// log('tinker.save();');

	events.publish('tinker.save');
	layout.wrapper.submit();

	new Request.JSON({
		url: '/save',
		data: layout.wrapper,
		method: 'post',
		onSuccess: function(response) {
			if (response.status === 'ok') {
				data.hash = response.hash;
				data.revision = response.revision;
				data.revision_id = response.revision_id;

				inputHash.set('value', data.hash);
				inputRevision.set('value', data.revision);
				inputRevisionId.set('value', data.revision_id);
				saveButton.set('text', 'Save');

				var url = '/'+data.hash;
				url += data.revision > 0 ? '/'+data.revision : '';

				if (!!(window.history && history.pushState)) {
					history.pushState(null, null, url);
				} else {
					window.location = url;
				}
			} else if (response.status === 'error') {
				log(response.error.message);
			}
		}
	}).send();
};

module.exports = tinker;

if (window.Tinker.mode !== 'embed') {
	events.subscribe('layout.build', build);
}
if (data.hash) {
	events.subscribe('result.build', run);
}

