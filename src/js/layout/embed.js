/*
layout/embed.js

author: @chielkunkels
*/'use strict';
// log('layout/embed.js');

// required modules
var data = require('../data');
var events = require('../events');
var Panel = require('./panel');
var route = require('../route');
var urls = require('../urls');
var storage = require('../storage');

var wrapper, header, body, panels;
var layout = {};

var curPanel = null, curTab = null;
var validTabs = ['result', 'behaviour', 'markup', 'style'];

var build = function(){
	layout.wrapper = wrapper = new Element('form#wrapper', {
		method: 'post',
		action: urls.sandbox,
		target: 'sandbox'
	}).inject(document.body);

	header = new Element('header').inject(wrapper);
	layout.body = body = new Element('div#body').inject(wrapper);

	layout.panels = panels = [
		new Panel(body, 0),
		new Panel(body, 1),
		new Panel(body, 2),
		new Panel(body, 3)
	];

	Array.each(panels, function(p) {
		p.getOuter().setStyles({
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			zIndex: 1
		});
	});

	var tabs = route.param('tabs');
	if (tabs) {
		tabs = tabs.split(',');
		var temp = [];
		Array.each(tabs, function(tab){
			if (validTabs.contains(tab)) {
				temp.push(tab);
			}
		});
		tabs = temp;
	} else {
		tabs = validTabs;
	}

	var tabHtml = '';
	Array.each(tabs, function(tab) {
		tabHtml += '<li><a href="#'+tab+'" class="tab-'+tab+'">'+String.capitalize(tab)+'</a></li>';
	});
	var tabContainer = new Element('ul.tabs', {html: tabHtml});

	tabContainer.addEvent('click:relay(a)', function(e) {
		e.preventDefault();

		var tab = e.target.get('href').slice(1);
		var nextPanel = panelContaining(tab);
		panels[curPanel].getOuter().setStyle('z-index', 1);
		nextPanel.getOuter().setStyle('z-index', 2);
		tabContainer.getElement('.tab-'+curTab).removeClass('is-active');
		tabContainer.getElement('.tab-'+tab).addClass('is-active');
		curPanel = nextPanel.index;
		curTab = tab;
	}).inject(header);

	// ewh. hidden inputs to simulate the settings inputs
	var html = '<input type="hidden" name="doctype" value="'+data.doctype+'">'+
		'<input type="hidden" name="framework" value="'+data.framework+'">';
	if (data.normalize) {
		html += '<input type="hidden" name="normalize">';
	}
	if (data.extensions.length) {
		Array.each(data.extensions, function(extension) {
			html += '<input type="hidden" name="extensions[]" value="'+extension+'">';
		});
	}
	if (data.assets.length) {
		Array.each(data.assets, function(asset) {
			html += '<input type="hidden" name="assets[]" value="'+asset+'">';
		});
	}
	html += '<input type="hidden" name="title" value="'+data.title+'">'+
		'<input type="hidden" name="description" value="'+data.description+'">';
	new Element('div', {html: html}).setStyle('display', 'none').inject(wrapper);

	events.publish('layout.build');

	curTab = route.param('active', 'result');
	if (tabs.indexOf(curTab) === -1) {
		curTab = tabs[0];
	}
	var nextPanel = panelContaining(curTab);
	nextPanel.getOuter().setStyle('z-index', 2);
	curPanel = nextPanel.index;
	tabContainer.getElement('.tab-'+curTab).addClass('is-active');
};

//
layout.getPanel = function(index){
	// log('layout.getPanel(', index, ');');

	if (panels[index]) {
		return panels[index];
	}
	return false;
};

//
var panelContaining = function(frame){
	switch (frame) {
		case 'result': return panels[3];
		case 'markup': return panels[0];
		case 'style': return panels[1];
		case 'behaviour': return panels[2];
	}
};

events.subscribe('init', build);

module.exports = layout;

// these should probably loaded in some cleaner way, to avoid circular dependancies
require('../tinker');
require('../editor/markup');
require('../editor/style');
require('../editor/behaviour');
require('../result/default');
