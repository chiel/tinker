/*
layout/layouts/1.js

author: @chielkunkels
*/'use strict';
// log('layout/layouts/1.js');

var events = require('../../events'),
	storage = require('../../storage'),
	layout = require('../client'),
	spec = {}, handles = new Elements(), dragOptions = {};

var relativeSizes = [
	{x: 33, y: 50},
	{x: 33, y: 0},
	{x: 34, y: 100},
	{x: 0, y: 100}
];

// activate this layout
spec.activate = function(init){
	// log('layout.layouts.1.activate(', init, ');');

	window.addEvent('resize', resize);

	relativeSizes = storage.get('layout0Sizes', relativeSizes);

	var dimensions = getDimensions();
	if (init) {
		layout.fx.set(dimensions);
		build();
		recalibrate();
		events.publish('layout.activate');
	} else {
		layout.fx.start(dimensions).chain(function() {
			build();
			recalibrate();
			events.publish('layout.activate');
		});
	}
};

// deactivate this layout;
spec.deactivate = function(){
	log('layout.layouts.1.deactivate();');

	handles.dispose();
	window.removeEvent('resize', resize);
};

// calculate dimensions for each panel
var getDimensions = function(){
	// log('layout.layous.1.getDimensions();');

	var rs = relativeSizes,
		p = layout.panels,
		bSize = layout.body.getSize(),
		min = layout.min,
		opw = bSize.x / 100,
		oph = bSize.y / 100,
		d = {};

	d[0] = {
		top: 0,
		left: 0,
		width: Math.ceil(opw * rs[0].x),
		height: Math.ceil(oph * rs[0].y)
	};
	d[0].width = d[0].width < min.ox ? min.ox : d[0].width;
	d[0].height = d[0].height < min.oy ? min.oy : d[0].height;
	d[1] = {
		top: d[0].height,
		left: 0,
		width: Math.ceil(opw * rs[1].x),
		height: bSize.y - d[0].height
	};
	d[1].width = d[1].width < min.ox ? min.ox : d[1].width;
	d[2] = {
		top: 0,
		left: d[0].width,
		width: Math.ceil(opw * rs[2].x),
		height: bSize.y
	};
	d[2].width = d[2].width < min.ox ? min.ox : d[2].width;
	d[3] = {
		top: 0,
		left: d[0].width + d[2].width,
		width: bSize.x - (d[0].width + d[2].width),
		height: bSize.y
	};

	return d;
};

// build up layout-specific elements
var build = function(){
	// log('layout.layous.1.build();');

	if (handles.length === 0) {
		handles.push(
			new Element('div.handle.horz.h1').store('handleId', 0),
			new Element('div.handle.vert.h2').store('handleId', 1),
			new Element('div.handle.vert.h3').store('handleId', 2)
		);
		handles.addEvent('mousedown', function(e) {
			dragStart(e, e.target);
		});
	}

	handles.inject(layout.body);
};

// recalibrate, making sure handles are displayed correctly
var recalibrate = function(){
	// log('layout.layous.1.recalibrate();');

	var p = layout.panels,
		p0 = p[0].getCoords(),
		p2 = p[2].getCoords(),
		p3 = p[3].getCoords();

	handles[0].setStyles({
		top: p0.y2,
		left: p0.x1,
		width: p0.x2 - p0.x1
	});
	handles[1].setStyles({
		top: p0.y1,
		left: p0.x2,
		height: p2.y2 - p2.y1
	});
	handles[2].setStyles({
		top: p0.y1,
		left: p2.x2,
		height: p2.y2 - p2.y1
	});
};

// drag start event
var dragStart = function(e, handle){
	// log('layout.layous.1.dragStart();');

	e.stop();
	var p = layout.panels, d = dragOptions, p1, p2;

	d.handle = handle;
	d.handleId = handle.retrieve('handleId');
	d.handlePos = handle.getPosition(layout.body);
	d.handleSize = handle.getSize();
	d.mousePos = e.client;

	events.publish('layout.dragStart');

	switch (d.handleId) {
		case 0: p1 = p[0].getCoords(); p2 = p[1].getCoords(); break;
		case 1: p1 = p[0].getCoords(); p2 = p[2].getCoords(); break;
		case 2: p1 = p[2].getCoords(); p2 = p[3].getCoords(); break;
		default: log('Unhandled handleId: ', d.handleId); break;
	}

	d.box = {
		x1: p1.x1,
		y1: p1.y1,
		x2: p2.x2,
		y2: p2.y2
	};

	if (d.handle.hasClass('horz')) {
		d.limits = {
			x1: d.box.x1,
			x2: d.box.x1,
			y1: d.box.y1 + 100,
			y2: d.box.y2 - 100 - d.handleSize.y
		};
	} else {
		d.limits = {
			x1: d.box.x1 + 200,
			x2: d.box.x2 - 200 - d.handleSize.x,
			y1: d.box.y1,
			y2: d.box.y1
		};
	}

	document.addEvents({
		mousemove: drag,
		mouseup: dragEnd
	});
};

// the actual drag
var drag = function(e){
	// log('layout.layous.1.drag();');

	var p = layout.panels,
		d = dragOptions,
		x = d.handlePos.x - (d.mousePos.x - e.client.x),
		y = d.handlePos.y - (d.mousePos.y - e.client.y);

	if (x < d.limits.x1) { x = d.limits.x1; }
	if (x > d.limits.x2) { x = d.limits.x2; }
	if (y < d.limits.y1) { y = d.limits.y1; }
	if (y > d.limits.y2) { y = d.limits.y2; }

	d.handle.setStyles({top: y, left: x});

	if (d.handleId === 0) {
		p[0].getOuter().setStyle('height', y + 5);
		p[1].getOuter().setStyles({
			top: y + 5,
			height: (d.box.y2 - y)
		});
	} else if (d.handleId === 1) {
		p[0].getOuter().setStyle('width', x + 5);
		p[1].getOuter().setStyle('width', x + 5);
		handles[0].setStyle('width', x - 5);
		p[2].getOuter().setStyles({
			left: x + 5,
			width: d.box.x2 - x
		});
	} else if (d.handleId === 2) {
		p[2].getOuter().setStyle('width', (x - d.box.x1) + 10);
		p[3].getOuter().setStyles({
			left: x + 5,
			width: d.box.x2 - x
		});
	}
};

// end drag
var dragEnd = function(e){
	// log('layout.layous.1.dragEnd();');

	events.publish('layout.dragEnd');
	document.removeEvents({
		mousemove: drag,
		mouseup: dragEnd
	});
	storeSizes();
};

/**
 * Handle window resizing
 */
var resize = function(){
	// log('layout.layous.1.resize();');

	var dimensions = getDimensions();
	layout.fx.set(dimensions);
	recalibrate();
};

/**
 * Store relative sizes of elements
 */
var storeSizes = function(){
	// log('layout.layous.1.storeSizes();');

	var p = layout.panels,
		bSize = layout.body.getSize(),
		opw = bSize.x / 100,
		oph = bSize.y / 100,
		p0Size = p[0].getOuter().getSize(),
		p1Size = p[1].getOuter().getSize(),
		p2Size = p[2].getOuter().getSize(),
		p3Size = p[3].getOuter().getSize();

	relativeSizes = [
		{x: Math.floor(p0Size.x/opw), y: Math.floor(p0Size.y/oph)},
		{x: Math.floor(p1Size.x/opw), y: 0},
		{x: Math.floor(p2Size.x/opw), y: 100},
		{x: 0, y: 100}
	];
	storage.set('layout0Sizes', relativeSizes);
};

events.subscribe('layout.build', function(){
	layout.addLayout(spec);
});

