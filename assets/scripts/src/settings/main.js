/*
settings/main.js

author: @chielkunkels
*/'use strict';
// log('settings/main.js');

var events = require('../events');
var Popover = require('../popover');
var layout = require('../layout/client');

var settings = {};
var wrapper, tabWrapper, sectionWrapper, tabs = [], sections = [], activeTab = null;

//
var build = function(){
	// log('settings.main.build();');

	wrapper = new Element('div', {html: '<ul class="tabs"></ul><div class="sections"></div>'});
	tabWrapper = wrapper.getElement('.tabs');
	sectionWrapper = wrapper.getElement('.sections');

	tabWrapper.addEvent('click:relay(a)', function(e) {
		e.preventDefault();

		activate(e.target.retrieve('index'));
	});

	events.publish('settings.build');

	var ul = new Element('ul.buttons', {html: '<li><a href="#settings" class="settings button">Settings</a></li>'});
	layout.addToRegion(ul, 'tl');
	var popover = new Popover(wrapper, {button: ul.getElement('.settings')});
	popover.element.addClass('po-settings');
};

//
settings.addSection = function(name, content){
	// log('settings.main.addSection(', name, content, ');');

	var tab = new Element('a', {href: '#', text: name}).store('index', tabs.length);
	var section = new Element('div.section').adopt(content);
	tabs.push(tab);
	sections.push(section);
	tabWrapper.adopt(new Element('li').adopt(tab));
	sectionWrapper.adopt(section);

	if (tabs.length === 1) {
		activate(0);
	}
};

//
var activate = function(index){
	// log('settings.main.activate(', index, ');');

	if (activeTab !== null) {
		tabs[activeTab].removeClass('is-active');
		sections[activeTab].removeClass('is-active');
	}

	tabs[index].addClass('is-active');
	sections[index].addClass('is-active');
	activeTab = index;
};

events.subscribe('layout.build', build);

module.exports = settings;

require('./general');
require('./assets');
require('./info');

