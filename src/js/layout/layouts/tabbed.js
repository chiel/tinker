/*
layout/layouts/tabbed.js

author: Pavel Strakhov
*/'use strict';

var events = require('../../events'),
	storage = require('../../storage'),
	layout = require('../client'),
	spec = {}, handles = new Elements(), dragOptions = {};

var relativeSizes = [
	{x: 50, y: 33},
	{x: 50, y: 33},
	{x: 50, y: 33},
	{x: 0, y: 100}
];

// Activate this layout
spec.activate = function(init){
	$$("#editor_tabs").show();
	
	window.addEvent('resize', resize);

	relativeSizes = storage.get('layout1Sizes', relativeSizes);

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

// deactivate this layout
spec.deactivate = function(init){
	// log('layout/layouts/2.deactivate();');
	$$("#editor_tabs").hide();

	handles.dispose();
	window.removeEvent('resize', resize);
};

// calculate dimensions for each panel
var getDimensions = function() {
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
		height: bSize.y
	};
	d[1] = d[0];
	d[2] = d[0];
	d[3] = {
		top: 0,
		left: d[0].width,
		width: bSize.x - d[0].width,
		height: bSize.y
	};

	return d;
};

// build up layout-specific elements
var build = function(){

	if (handles.length === 0) {
		handles.push(
			new Element('div.handle.vert.h3').store('handleId', 0)
		);
		handles.addEvent('mousedown', function(e) {
			dragStart(e, e.target);
		});
	}

	handles.inject(layout.body);
};

// recalibrate, making sure handles are displayed correctly
var recalibrate = function(){

	var p = layout.panels,
		p0 = p[0].getCoords(),
		p1 = p[1].getCoords(),
		p3 = p[3].getCoords();

	handles[0].setStyles({
		top: p0.y1,
		left: p0.x2,
		height: p3.y2 - p3.y1
	});
};

// drag start event
var dragStart = function(e, handle){

	e.stop();
	var p = layout.panels, d = dragOptions, p1, p2;

	d.handle = handle;
	d.handleId = handle.retrieve('handleId');
	d.handlePos = handle.getPosition(layout.body);
	d.handleSize = handle.getSize();
	d.mousePos = e.client;

	events.publish('layout.dragStart');

	switch (d.handleId) {
		case 0: p1 = p[0].getCoords(); p2 = p[3].getCoords(); break;
		default: log('Unhandled handleId: ', d.handleId); break;
	}

	d.box = {
		x1: p1.x1,
		y1: p1.y1,
		x2: p2.x2,
		y2: p2.y2
	};

	d.limits = {
		x1: d.box.x1 + 200,
		x2: d.box.x2 - 200 - d.handleSize.x,
		y1: d.box.y1,
		y2: d.box.y1
	};

	document.addEvents({
		mousemove: drag,
		mouseup: dragEnd
	});
};

// the actual drag
var drag = function(e){

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
		p[0].getOuter().setStyle('width', x + 5);
		p[1].getOuter().setStyle('width', x + 5);
		p[2].getOuter().setStyle('width', x + 5);
		p[3].getOuter().setStyles({
			left: x + 5,
			width: d.box.x2 - x
		});
	}
};

// end drag
var dragEnd = function(e){

	events.publish('layout.dragEnd');
	document.removeEvents({
		mousemove: drag,
		mouseup: dragEnd
	});
	storeSizes();
};

// handle window resizing
var resize = function(){

	var dimensions = getDimensions();
	layout.fx.set(dimensions);
	recalibrate();
};

// store relative sizes of elements
var storeSizes = function(){

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
		{x: Math.floor(p1Size.x/opw), y: Math.floor(p1Size.y/oph)},
		{x: Math.floor(p2Size.x/opw), y: 0},
		{x: 0, y: 100}
	];
	storage.set('layout1Sizes', relativeSizes);
};

events.subscribe('layout.build', function(){
	layout.addLayout(spec);
});

