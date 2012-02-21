/*
---

license: MIT-style license

authors:
  - Chiel Kunkels (@chielkunkels)

...
*/
!function(T)
{
	'use strict';

	// Public stuff
	T.Layouts.push({
		activate: activate,
		deactivate: deactivate
	});

	// Private stuff
	var relativeSizes = [
			{x: 33, y: 50},
			{x: 33, y: 0},
			{x: 34, y: 100},
			{x: 0, y: 100}
		], handles = new Elements(),
		dragOpts = {};

	/**
	 * Activate this layout
	 */
	function activate(init)
	{
		// log('layouts[n].activate();');

		window.addEvent('resize', resize);

		relativeSizes = T.Storage.get('layout0Sizes', relativeSizes);

		var dimensions = getDimensions();
		if (init) {
			T.Layout.fx.set(dimensions);
			build();
			recalibrate();
			T.Events.fireEvent('layout.activate');
		} else {
			T.Layout.fx.start(dimensions).chain(function() {
				build();
				recalibrate();
				T.Events.fireEvent('layout.activate');
			});
		}
	}

	/**
	 *
	 */
	function deactivate(init)
	{
		// log('layouts[n].deactivate();');

		handles.dispose();
		window.removeEvent('resize', resize);
	}

	/**
	 * Get dimensions for panels based on passed relative sizes
	 */
	function getDimensions()
	{
		// log('layouts[n].getDimensions();');

		var rs = relativeSizes,
			p = T.Layout.panels,
			bSize = T.Layout.body.getSize(),
			min = T.Layout.min,
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
	}

	/**
	 *
	 */
	function build()
	{
		// log('layouts[n].build();');

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

		handles.inject(T.Layout.body);
	}

	/**
	 *
	 */
	function recalibrate()
	{
		// log('layouts[n].recalibrate()');

		var p = T.Layout.panels,
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
	}

	/**
	 * Handle starting drag
	 */
	function dragStart(e, handle)
	{
		// log('layouts[n].dragStart(', e, handle, ');');

		e.stop();
		var p = T.Layout.panels, d = dragOpts, p1, p2;

		d.handle = handle;
		d.handleId = handle.retrieve('handleId');
		d.handlePos = handle.getPosition(T.Layout.body);
		d.handleSize = handle.getSize();
		d.mousePos = e.client;

		T.Events.fireEvent('layout.dragStart');

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
	}

	/**
	 *
	 */
	function drag(e)
	{
		// log('layouts[n].drag(', e, ');');

		var p = T.Layout.panels,
			d = dragOpts,
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
	}

	/**
	 * Drag end event
	 */
	function dragEnd(e)
	{
		// log('layouts[n].dragEnd(', e, ');');

		T.Events.fireEvent('layout.dragEnd');
		document.removeEvents({
			mousemove: drag,
			mouseup: dragEnd
		});
		storeSizes();
	}

	/**
	 * Handle window resizing
	 */
	function resize()
	{
		// log('layouts[n].resize();');

		var dimensions = getDimensions();
		T.Layout.fx.set(dimensions);
		recalibrate();
	}

	/**
	 * Store relative sizes of elements
	 */
	function storeSizes()
	{
		// log('layouts[n].storeSizes();');

		var p = T.Layout.panels,
			bSize = T.Layout.body.getSize(),
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
		T.Storage.set('layout0Sizes', relativeSizes);
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

