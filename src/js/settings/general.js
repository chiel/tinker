/*
settings/general.js

author: @chielkunkels
*/'use strict';
// log('settings/general.js');

var events = require('../events');
var settings = require('./main');
var tinker;

var doctypes = [], frameworks = [], versions = {}, extList;

doctypes = JSON.parse(document.getElement('script[type=doctypes]').get('html'));
frameworks = JSON.parse(document.getElement('script[type=frameworks]').get('html'));
Array.each(frameworks, function(framework) {
	Array.each(framework.versions, function(version) {
		version.x_framework_id = framework.id;
		versions[version.id] = version;
	});
});

var build = function(){
	// log('settings.general.build();');

	tinker = require('../tinker');
	var html = '<ul>'+
		'<li><label for="input-doctype">Doctype</label><select id="input-doctype" name="doctype"></select></li>'+
		'<li><label for="input-js-framework">Framework</label><select id="input-js-framework" name="framework"><option value="0">None</option></select><ul id="extension-list"></ul></li>'+
		'<li><label for="input-css-framework">Normalize.css</label><input type="checkbox" id="input-css-framework" name="normalize" checked></li>'+
		'</ul>';
	var fieldset = new Element('fieldset.settings-general', {html: html}),
		inputDoctype = fieldset.getElement('#input-doctype'),
		inputJS = fieldset.getElement('[id=input-js-framework]'),
		inputCSS = fieldset.getElement('#input-css-framework');
	extList = fieldset.getElement('#extension-list');

	inputJS.addEvent('change', function(e) {
		showExtensions(inputJS.getSelected()[0].get('value'));
	});

	if (tinker.framework) {
		showExtensions(tinker.framework, true);
	}

	Array.each(doctypes, function(doctype) {
		inputDoctype.adopt(new Element('option', {text: doctype.name, value: doctype.id}));
	});

	Array.each(frameworks, function(framework) {
		var optgroup = new Element('optgroup', {label: framework.name, value: framework.id}).inject(inputJS);
		Array.each(framework.versions, function(version) {
			var option = new Element('option', {text: framework.name+' '+version.name, value: version.id}).inject(optgroup);
			if (tinker.framework === version.id) {
				option.set('selected', true);
			}
		});
	});

	events.publish('settings.general.build');
	settings.addSection('General', fieldset);
};

//
var showExtensions = function(index, init){
	extList.empty();
	var selected = versions[index];
	if (selected && selected.extensions && selected.extensions.length) {
		Array.each(selected.extensions, function(extension, index) {
			new Element('li', {children: [
				new Element('input[type=checkbox]', {
					id: 'extension-'+index,
					name: 'extensions[]',
					value: extension.id,
					checked: init && tinker.extensions.contains(extension.id)
				}),
				new Element('label', {'for': 'extension-'+index, text: extension.name})
			]}).inject(extList);
		});
	}
};

events.subscribe('settings.build', build);

