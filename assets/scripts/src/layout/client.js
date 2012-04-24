/*
layout/client.js

author: @chielkunkels
*/'use strict';
// log('layout/client.js');

// required modules
var events = require('../events');
var Panel = require('./panel');
var urls = require('../urls');
var storage = require('../storage');

// setup
var layout = {}, layouts = [], layoutCount = 0, curLayout,
	wrapper, header, body, footer, regions, panels,
	picker, pickerArrow, pickerList, pickerButtons = [];

// minimum dimensions for each frame
layout.min = {
	x: 200, y: 100,
	ox: 210, oy: 110
};

// build up the main ui
var build = function(config){
	// log('layout.client.build(', config, ');');

	layout.wrapper = wrapper = new Element('form#wrapper', {
		method: 'post',
		action: urls.sandbox,
		target: 'sandbox'
	}).inject(document.body);

	header = new Element('header').inject(wrapper);
	layout.body = body = new Element('div#body').inject(wrapper);
	footer = new Element('footer').inject(wrapper);

	regions = {
		tl: new Element('div.region.tl').inject(header),
		tm: new Element('div.region.tm').inject(header),
		tr: new Element('div.region.tr').inject(header),
		bl: new Element('div.region.bl').inject(footer),
		bm: new Element('div.region.bm').inject(footer),
		br: new Element('div.region.br').inject(footer)
	};

	layout.panels = panels = [
		new Panel(body, 0),
		new Panel(body, 1),
		new Panel(body, 2),
		new Panel(body, 3)
	];

	picker = new Element('div#layoutpicker', {
		children: [
			pickerArrow = new Element('div.arrow', {
				morph: {duration: 150}
			}),
			pickerList = new Element('ul')
		]
	}).addEvent('click', function(e){
		e.preventDefault();
		if (e.target.get('tag') === 'a') {
			layout.activate(e.target.get('data-index'));
		}
	});
	layout.addToRegion(picker, 'bm');

	var els = panels.map(function(p) { return p.getOuter(); });
	layout.fx = new Fx.Elements(els, {duration: 200});
	events.publish('layout.build');
	layout.activate(storage.get('activeLayout', 0));
};

// add an element to a region
layout.addToRegion = function(el, region){
	// log('layout.client.addToRegion(', el, region, ');');

	if (!regions[region]) {
		return;
	}
	if (typeOf(el) !== 'element') {
		return;
	}

	regions[region].adopt(el);
};

// add a layout spec to the layout-picker
layout.addLayout = function(spec){
	// log('layout.client.addLayout(', spec, ');');

	// Check if at least activate and deactivate are defined
	if (!(spec.hasOwnProperty('activate') && typeOf(spec.activate) === 'function') ||
		!(spec.hasOwnProperty('deactivate') && typeOf(spec.deactivate) === 'function')) {
		return;
	}

	var li = new Element('li', {
		html: '<a href="#layout{index}" class="button-layout ls-{index}" data-index="{index}"></a>'.substitute({index: layoutCount})
	});
	pickerList.adopt(li);
	pickerButtons.push(li.getElement('.ls-'+layoutCount));
	layouts.push(spec);
	layoutCount++;
};

// activate a layout by index
layout.activate = function(index){
	// log('layout.client.activate(', index, ');');

	index = parseInt(index, 0);

	if (index !== curLayout) {
		var init = curLayout === undefined;

		if (init && !layouts[index]) {
			index = 0;
		}

		if (!init && layouts[curLayout]) {
			pickerButtons[curLayout].removeClass('active');
			document.html.removeClass('layout-'+curLayout);
			layouts[curLayout].deactivate();
		}

		if (layouts[index]) {
			var pos = pickerButtons[index].getPosition(picker),
				size = pickerButtons[index].getSize();
			pickerArrow.morph({left: (pos.x + (size.x/2) - 5)});
			pickerButtons[index].addClass('active');
			document.html.addClass('layout-'+index);
			storage.set('activeLayout', index);
			layouts[index].activate(init);
			curLayout = index;
		}
	}
};

// retrieve a panel by index
layout.getPanel = function(index){
	// log('layout.client.getPanel(', index, ');');

	if (!panels[index]) {
		return false;
	}
	return panels[index];
};

// wait for init
events.subscribe('init', build);

module.exports = layout;

// these should probably loaded in some cleaner way, to avoid circular dependancies
require('../settings/main');
require('./layouts/1');
require('./layouts/2');
require('../editor/markup');
require('../editor/style');
require('../editor/behaviour');
require('../result/default');

