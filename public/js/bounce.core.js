/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

/**
 * console.log wrapper
 */
window.log = function()
{
	if (window.console) {
		console.log(Array.prototype.slice.call(arguments));
	}
};

(function() {

/**
 * Init function which fires an event
 */
BNC.init = function(config)
{
	// log('BNC.init(', config, ');');

	BNC.Events.fireEvent('bnc.init', config);
};



/**
 *
 */
BNC.Events = new Events;



/**
 *
 */
BNC.Core = {
	/**
	 *
	 */
	wake: function()
	{
		BNC.Events.addEvent('bnc.init', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function(config)
	{
		// log('BNC.Core.init(', config, ');');
	}
};
BNC.Core.wake();



/**
 *
 */
BNC.Bouncie = {
	/**
	 *
	 */
	markup: null,
	/**
	 *
	 */
	style: null,
	/**
	 *
	 */
	interaction: null,

	/**
	 *
	 */
	wake: function()
	{
		BNC.Events.addEvent('bnc.init', this.init.bind(this));
	},

	/**
	 * Store data for the current bouncie
	 */
	init: function(config)
	{
		// log('BNC.Bouncie.init(', config, ');');

		this.properties = JSON.parse(document.getElement('script[type=bouncie/properties]').get('html'));
		this.markup = document.getElement('script[type=bouncie/markup]').get('html');
		this.style = document.getElement('script[type=bouncie/style]').get('html');
		this.interaction = document.getElement('script[type=bouncie/interaction]').get('html');

		BNC.Events.addEvent('bnc.layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		log('BNC.Bouncie.build();');

		var self = this;
		var buttons = '<li><a href="#execute" class="button">Execute</a></li>'
			+'<li><a href="#save" class="button primary">Save</a></li>';
		var el = new Element('ul', {
			html: buttons,
			events: {
				click: function(e) {
					e.stop();
					var href = e.target.get('href');
					if (href === '#execute') {
						self.execute();
					} else if (href === '#save') {
						self.save();
					}
				}
			}
		});
		BNC.Layout.addToRegion(el, 'br');
	},

	/**
	 * Get properties for current bouncie
	 */
	getProperties: function()
	{
		// log('BNC.Bouncie.getProperties();');

		return this.properties;
	},

	/**
	 * Get markup for current bouncie
	 */
	getMarkup: function()
	{
		// log('BNC.Bouncie.getMarkup();');

		return this.markup;
	},

	/**
	 * Get style for current bouncie
	 */
	getStyle: function()
	{
		// log('BNC.Bouncie.getStyle();');

		return this.style;
	},

	/**
	 * Get interaction for current bouncie
	 */
	getInteraction: function()
	{
		// log('BNC.Bouncie.getInteraction();');

		return this.interaction;
	},

	/**
	 * Execute the current bouncie in the result frame
	 */
	execute: function()
	{
		log('BNC.Bouncie.execute();');

		BNC.Events.fireEvent('bnc.bouncie.save');
		BNC.Layout.wrapper.submit();
	},

	/**
	 * Save the current bouncie
	 */
	save: function()
	{
		log('BNC.Bouncie.save();');

		BNC.Events.fireEvent('bnc.bouncie.save');

		var url = '/save';
		if (this.properties.hash) {
			url += '/'+this.properties.hash;
		}
		new Request({
			url: url,
			data: BNC.Layout.wrapper,
			method: 'post'
		}).send();
	}
};
BNC.Bouncie.wake();



/**
 *
 */
BNC.Layout = {
	/**
	 * The currently active layout
	 */
	curLayout: null,
	/**
	 * The form wrapping everything
	 */
	form: null,
	/**
	 * Header element
	 */
	header: null,
	/**
	 * Body element
	 */
	body: null,
	/**
	 * Footer element
	 */
	footer: null,
	/**
	 * Available panels
	 */
	panels: [],
	/**
	 * Fx object to animate between layouts
	 */
	fx: null,

	/**
	 *
	 */
	wake: function()
	{
		BNC.Events.addEvent('bnc.init', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function(config)
	{
		log('BNC.Layout.init(', config, ');');

		this.build();
	},

	/**
	 * Build basic layout elements shared between layouts
	 */
	build: function()
	{
		log('BNC.Layout.build();');

		document.body.setStyle('opacity', 0).set('morph', {duration: 250});

		this.wrapper = new Element('form#wrapper', {
			method: 'post',
			action: 'http://bounce-sandbox.dev/',
			target: 'sandbox'
		}).inject(document.body);

		this.header = new Element('header').inject(this.wrapper);
		this.body = new Element('div#body').inject(this.wrapper);
		this.footer = new Element('footer').inject(this.wrapper);

		this.regions = {
			tl: new Element('div.region.tl').inject(this.header),
			tr: new Element('div.region.tr').inject(this.header),
			bl: new Element('div.region.bl').inject(this.footer),
			br: new Element('div.region.br').inject(this.footer)
		};

		this.panels = [
			new BNC.Panel(this.body, 0),
			new BNC.Panel(this.body, 1),
			new BNC.Panel(this.body, 2),
			new BNC.Panel(this.body, 3)
		];

		var els = this.panels.map(function(p) { return p.getOuter(); });
		this.fx = new Fx.Elements(els, {duration: 200});
		this.activate();
		BNC.Events.fireEvent('bnc.layout.build');
	},

	/**
	 * Activate a layout by index
	 */
	activate: function(index)
	{
		log('BNC.Layout.activate();');

		if (index !== this.curLayout) {
			var init = this.curLayout === null;

			if (init && !BNC.Layouts[index]) {
				index = 0;
			}

			if (!init && BNC.Layouts[this.curLayout]) {
				document.html.removeClass('layout-'+this.curLayout);
				BNC.Layouts[this.curLayout].deactivate();
			}

			if (BNC.Layouts[index]) {
				document.html.addClass('layout-'+index);
				BNC.Layouts[index].activate();
				this.curLayout = index;
			}
		}
	},

	/**
	 * Retrieve a panel by index
	 */
	getPanel: function(index)
	{
		if (this.panels[index]) {
			return this.panels[index];
		}
		return false;
	},

	/**
	 * Add an element to a region
	 */
	addToRegion: function(node, region)
	{
		if (!this.regions[region]) {
			return;
		}
		if (typeOf(node) !== 'element') {
			return;
		}

		this.regions[region].adopt(node);
	}
};
BNC.Layout.wake();



/**
 * A collection of existing layouts
 */
BNC.Layouts = []



/**
 * Default layout
 */
BNC.Layouts.push({
	/**
	 * Drag handles
	 */
	handles: [],

	/**
	 * Relative size of the panels
	 */
	relativeSizes: [
		{x: 33, y: 50},
		{x: 33, y: 0},
		{x: 34, y: 100},
		{x: 0, y: 100}
	],

	/**
	 * Activate this layout
	 */
	activate: function()
	{
		log('BNC.Layouts[0].activate();');

		var dimensions = this.getDimensions();
		BNC.Layout.fx.set(dimensions);
		document.body.morph({opacity: [0, 1]});
		this.build();
		this.recalibrate();
	},

	/**
	 * Deactivate this layout
	 */
	deactivate: function()
	{
		log('BNC.Layouts[0].deactivate();');
	},

	/**
	 * Build up any additional element required for this layout
	 */
	build: function()
	{
		log('BNC.Layouts[0].build();');

		if (this.handles.length === 0) {
			var self = this;
			this.handles = new Elements([
				new Element('div.handle.horz.h1').store('handleId', 0),
				new Element('div.handle.vert.h2').store('handleId', 1),
				new Element('div.handle.vert.h3').store('handleId', 2)
			]).addEvent('mousedown', function(e) {
				self.dragStart(e, e.target);
			});
		}

		this.handles.inject(BNC.Layout.body);
	},

	/**
	 * Recalibrate handle positions/sizes
	 */
	recalibrate: function()
	{
		log('BNC.Layouts[0].recalibrate()');

		var p = BNC.Layout.panels,
			p0 = p[0].getCoords(),
			p2 = p[2].getCoords(),
			p3 = p[3].getCoords();

		this.handles[0].setStyles({
			top: p0.y2,
			left: p0.x1,
			width: p0.x2 - p0.x1
		});
		this.handles[1].setStyles({
			top: p0.y1,
			left: p0.x2,
			height: p2.y2 - p2.y1
		});
		this.handles[2].setStyles({
			top: p0.y1,
			left: p2.x2,
			height: p2.y2 - p2.y1
		});
	},

	/**
	 * Calculate the dimensions of each panel based on relative sizing
	 */
	getDimensions: function()
	{
		// log('BNC.Layouts[0].getDimensions();');

		var rs = this.relativeSizes,
			bSize = BNC.Layout.body.getSize(),
			opw = bSize.x / 100,
			oph = bSize.y / 100,
			d = {};

		d[0] = {
			top: 0,
			left: 0,
			width: Math.ceil(opw * rs[0].x),
			height: Math.ceil(oph * rs[0].y)
		};
		d[1] = {
			top: d[0].height,
			left: 0,
			width: Math.ceil(opw * rs[1].x),
			height: bSize.y - d[0].height
		};
		d[2] = {
			top: 0,
			left: d[0].width,
			width: Math.ceil(opw * rs[2].x),
			height: bSize.y
		};
		d[3] = {
			top: 0,
			left: d[0].width + d[2].width,
			width: bSize.x - (d[0].width + d[2].width),
			height: bSize.y
		};

		return d;
	},

	/**
	 * Handle starting drag
	 */
	dragStart: function(e, el)
	{
		// log('BNC.Layouts[0].dragStart(',e,el,')');

		e.stop();
		var p = BNC.Layout.panels,
			handleId = el.retrieve('handleId'),
			handlePos = el.getPosition(BNC.Layout.body),
			handleSize = el.getSize(),
			mouseStart = e.client;

		BNC.Events.fireEvent('bnc.layout.dragStart');

		switch (handleId) {
			case 0: var p1 = p[0].getCoords(), p2 = p[1].getCoords(); break;
			case 1: var p1 = p[0].getCoords(), p2 = p[2].getCoords(); break;
			case 2: var p1 = p[2].getCoords(), p2 = p[3].getCoords(); break;
		}

		var box = {
			x1: p1.x1,
			y1: p1.y1,
			x2: p2.x2,
			y2: p2.y2
		};

		if (el.hasClass('horz')) {
			var limits = {
				x1: handlePos.x, x2: handlePos.x,
				y1: box.y1 + 100, y2: box.y2 - 100 - handleSize.y
			};
		} else {
			var limits = {
				x1: box.x1 + 200, x2: box.x2 - 200 - handleSize.x,
				y1: handlePos.y, y2: handlePos.y
			};
		}

		// Handle being dragged
		var mousemove = function(e) {
			var x = handlePos.x - (mouseStart.x - e.client.x),
				y = handlePos.y - (mouseStart.y - e.client.y);

			// Ensure the handle is within it's bounds
			if (x < limits.x1) { x = limits.x1; }
			if (x > limits.x2) { x = limits.x2; }
			if (y < limits.y1) { y = limits.y1; }
			if (y > limits.y2) { y = limits.y2; }

			el.setStyles({top: y, left: x});

			if (handleId === 0) {
				p[0].getOuter().setStyle('height', y + 5);
				p[1].getOuter().setStyles({
					top: y + 5,
					height: (box.y2 - y) + 5
				});
			} else if (handleId === 1) {
				p[0].getOuter().setStyle('width', x + 5);
				p[1].getOuter().setStyle('width', x + 5);
				this.handles[0].setStyle('width', x - 10);
				p[2].getOuter().setStyles({
					left: x + 5,
					width: box.x2 - x
				});
			} else if (handleId === 2) {
				p[2].getOuter().setStyle('width', (x - box.x1) + 10);
				p[3].getOuter().setStyles({
					left: x + 5,
					width: (box.x2 - x) + 5
				});
			}

		}.bind(this);

		// Drag end
		var mouseup = function(e) {
			BNC.Events.fireEvent('bnc.layout.dragEnd');

		// 	// Store relative sizes of elements
		// 	var bSize = BNC.Layout.body.getSize(),
		// 		opw = bSize.x / 100,
		// 		oph = bSize.y / 100,
		// 		p0Size = p[0].getSize(),
		// 		p1Size = p[1].getSize(),
		// 		p2Size = p[2].getSize(),
		// 		p3Size = p[3].getSize();

		// 	self.relativeSizes = [
		// 		{x: Math.round(p0Size.x/opw), y: Math.round(p0Size.y/oph)},
		// 		{x: Math.round(p1Size.x/opw), y: 0},
		// 		{x: Math.round(p2Size.x/opw), y: 100},
		// 		{x: 0, y: 100}
		// 	];

			document.removeEvents({
				mousemove: mousemove,
				mouseup: mouseup
			});
		};
		document.addEvents({
			mousemove: mousemove,
			mouseup: mouseup
		});
	}
});



/**
 * Create a panel which can hold result/editor frames
 */
BNC.Panel = new Class({
	/**
	 * The panel's parent
	 */
	wrapper: null,
	/**
	 * The outer panel, less UI calculations needed
	 */
	outer: null,
	/**
	 * The inner element, this handles spacing
	 */
	inner: null,

	/**
	 * Create basic markup required for a panel
	 */
	initialize: function(wrapper, index)
	{
		// log('BNC.Panel.initialize(', wrapper, index, ');');

		this.wrapper = wrapper;
		this.outer = new Element('section#panel'+index).inject(this.wrapper);
		this.inner = new Element('div.inner').inject(this.outer);
	},

	/**
	 * Retrieve the panel's outer element
	 */
	getOuter: function()
	{
		// log('BNC.Panel.getOuter();', this.outer);

		return this.outer;
	},

	/**
	 * Retrieve the panel's inner element
	 */
	getInner: function()
	{
		log('BNC.Panel.getInner();');

		return this.inner;
	},

	/**
	 * Get coords for a panel's inner element, relative to the wrapper
	 */
	getCoords: function()
	{
		// log('BNC.Panel.getCoords();');

		var pos = this.inner.getPosition(this.wrapper),
			size = this.inner.getSize();

		return {
			x1: pos.x,
			y1: pos.y,
			x2: pos.x + size.x,
			y2: pos.y + size.y
		};
	}

});



/**
 * Shared functionality across editors
 */
BNC.Editor = {
	/**
	 * Options that are shared by all codemirror instances
	 */
	mirrorOptions: {
		tabSize: 4,
		indentUnit: 4,
		indentWithTabs: true,
		lineNumbers: true,
		matchBrackets: true,
		fixedGutter: true,
		theme: 'bounce-light'
	},

	/**
	 *
	 */
	wake: function()
	{
		BNC.Events.addEvent('bnc.layout.build', this.init.bind(this));
		BNC.Events.addEvent('bnc.bouncie.save', this.save.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		log('BNC.Editor.init();');

		this.build();
	},

	/**
	 *
	 */
	build: function()
	{
		log('BNC.Editor.build();');
	},

	/**
	 * Copy codemirror contents to it's textarea
	 */
	save: function()
	{
		this.codemirror.save();
	}
};



/**
 *
 */
BNC.MarkupEditor = Object.merge({}, BNC.Editor, {
	/**
	 *
	 */
	build: function()
	{
		log('BNC.MarkupEditor.build();');

		var panel = BNC.Layout.getPanel(0);
		if (panel) {
			this.frame = new Element('div.frame');
			this.textarea = new Element('textarea', {
				name: 'markup',
				html: BNC.Bouncie.getMarkup()
			});
			this.frame.adopt(this.textarea).inject(panel.getInner());
			var options = Object.append({mode: 'text/html'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
		}
	}
});
BNC.MarkupEditor.wake();



/**
 *
 */
BNC.StyleEditor = Object.merge({}, BNC.Editor, {
	/**
	 *
	 */
	build: function()
	{
		log('BNC.MarkupEditor.build();');

		var panel = BNC.Layout.getPanel(1);
		if (panel) {
			this.frame = new Element('div.frame');
			this.textarea = new Element('textarea', {
				name: 'style',
				html: BNC.Bouncie.getStyle()
			});
			this.frame.adopt(this.textarea).inject(panel.getInner());
			var options = Object.append({mode: 'text/css'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
		}
	}
});
BNC.StyleEditor.wake();



/**
 *
 */
BNC.InteractionEditor = Object.merge({}, BNC.Editor, {
	/**
	 *
	 */
	build: function()
	{
		log('BNC.MarkupEditor.build();');

		var panel = BNC.Layout.getPanel(2);
		if (panel) {
			this.frame = new Element('div.frame');
			this.textarea = new Element('textarea', {
				name: 'interaction',
				html: BNC.Bouncie.getInteraction()
			});
			this.frame.adopt(this.textarea).inject(panel.getInner());
			var options = Object.append({mode: 'text/javascript'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
		}
	}
});
BNC.InteractionEditor.wake();



/**
 *
 */
BNC.Result = {
	/**
	 *
	 */
	wake: function()
	{
		BNC.Events.addEvent('bnc.layout.build', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		log('BNC.Result.init()');

		BNC.Events.addEvent('bnc.layout.dragStart', this.showOverlay.bind(this));
		BNC.Events.addEvent('bnc.layout.dragEnd', this.hideOverlay.bind(this));

		this.build();
	},

	/**
	 *
	 */
	build: function()
	{
		log('BNC.Result.build();');

		var panel = BNC.Layout.getPanel(3);
		if (panel) {
			this.wrapper = panel.getInner();
			this.frame = new Element('div.frame');
			this.iframe = new Element('iframe', {name: 'sandbox'});
			this.frame.adopt(this.iframe).inject(this.wrapper);
		}
	},

	/**
	 * Create an overlay over the iframe
	 */
	buildOverlay: function()
	{
		// log('BNC.Result.buildOverlay();');

		if (!this.overlay) {
			this.overlay = new Element('div', {
				styles: {
					position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
					zIndex: 2, opacity: 1, background: 'transparent'
				}
			});
		}
	},

	/**
	 * Show the drag overlay to prevent mouse interference
	 */
	showOverlay: function()
	{
		// log('BNC.Result.showOverlay();');

		this.buildOverlay();
		this.overlay.inject(this.wrapper);
	},

	/**
	 * Hide the drag overlay
	 */
	hideOverlay: function()
	{
		// log('BNC.Result.hideOverlay();');

		this.overlay.dispose();
	}
};
BNC.Result.wake();

})(typeof BNC == 'undefined' ? (window.BNC = {}) : BNC);

