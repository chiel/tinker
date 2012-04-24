/*
tinker.js

author: @chielkunkels
*/'use strict';
// log('tinker.js');

var data = JSON.parse(document.getElement('script[type=tinker]').get('html'));
var tinker = {
	hash: data.hash || null,
	revision: data.revision || null,
	revision_id: data.revision_id || 0,
	x_user_id: data.x_user_id || null,
	username: data.username || null,
	doctype: data.doctype || null,
	framework: data.framework || null,
	extensions: data.extensions || [],
	normalize: data.normalize || null,
	assets: data.assets || [],
	title: data.title || null,
	description: data.description || null,
	markup: data.markup || null,
	style: data.style || null,
	interaction: data.interaction || null
};

var events = require('./events');
var layout = require('./layout/client');

// rewrite the url if needed
if (tinker.username) {
	var url = '/'+tinker.username+'/'+tinker.hash;
	if (tinker.revision) {
		url += '/'+tinker.revision;
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

	var saveLabel = tinker.username ? 'Fork' : 'Save',
		buttons;

	var html = '<li><a href="#run" class="button run">Run</a></li>'+
		'<li><a href="#save" class="button primary save">'+saveLabel+'</a></li>';
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
		inputHash = new Element('input[type=hidden]', {name: 'hash', value: tinker.hash}),
		inputRevision = new Element('input[type=hidden]', {name: 'revision', value: tinker.revision}),
		inputRevisionId = new Element('input[type=hidden]', {name: 'revision_id', value: tinker.revision_id})
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
				tinker.hash = response.hash;
				tinker.revision = response.revision;
				tinker.revision_id = response.revision_id;

				inputHash.set('value', tinker.hash);
				inputRevision.set('value', tinker.revision);
				inputRevisionId.set('value', tinker.revision_id);
				saveButton.set('text', 'Save');

				var url = '/'+tinker.hash;
				url += tinker.revision > 0 ? '/'+tinker.revision : '';

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

events.subscribe('layout.build', build);
if (tinker.hash) {
	events.subscribe('result.build', run);
}

