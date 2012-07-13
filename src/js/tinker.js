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
		inputHash = new Element('input[type=hidden]', {name: 'hash', value: data.hash}),
		inputRevision = new Element('input[type=hidden]', {name: 'revision', value: data.revision}),
		inputRevisionId = new Element('input[type=hidden]', {name: 'revision_id', value: data.revision_id})
	);

	var switch_current_editor = function(name) {
		layout.panels.each(function(panel) {
			panel.outer.removeClass("current");
		});
		$$("#editor_tabs a").removeClass("active");
		var i = { "markup": 0, "style": 1, "behaviour": 2 }[name];
		layout.panels[i].outer.addClass('current');
		events.publish("move_focus." + name);
		$$("#go_" + name).addClass('active');
	};

	var editor_tabs = new Element('ul.btn-group.is-hidden#editor_tabs', {
		html: 	'<li><a id="go_markup" href="#markup" class="button">HTML</a></li>'+
				'<li><a id="go_style" href="#style" class="button">CSS</a></li>'+
				'<li><a id="go_behaviour" href="#behaviour" class="button">JS</a></li>',
		events: {
			click: function(e) {
				e.preventDefault();
				var href = e.target.get('href');
				$$("#editor_tabs a").removeClass("active");
				if (href) {
					switch_current_editor(href.substr(1));
				}
			}
		}
	});
	layout.addToRegion(editor_tabs, 'tl');
	switch_current_editor('markup');


	var keyboard = new Keyboard({
		active: true,
		events: {
			"f1": function(e) {
				switch_current_editor('markup');
				e.stop();
			},
			"f2": function(e) {
				switch_current_editor('style');
				e.stop();
			},
			"f3": function(e) {
				switch_current_editor('behaviour');
				e.stop();
			},
			"ctrl+r": function(e) {
				run(),
				e.stop();
			},
			"ctrl+s": function(e) {
				save(),
				e.stop();
			}
		}
	});
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
