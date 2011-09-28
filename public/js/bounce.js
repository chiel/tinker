/**
 * @author Chiel Kunkels <hello@chielkunkels.com>
 */
"use strict";

/**
 * Global namespace
 */
var BNC = {
	/**
	 *
	 */
	id: 0,

	/**
	 *
	 */
	init: function(config)
	{
		console.log('BNC.init(',config,')');
		var self = this;
		self.setConfig(config);
		BNC.Layout.init();
	},

	/**
	 * Set config
	 */
	setConfig: function(config)
	{
		console.log('BNC.setConfig(',config,')');
		var self = this;
		self.config = config;
	},

	/**
	 * Get a config item by name
	 */
	getConfig: function(key, defaultValue)
	{
		console.log('BNC.getConfig(',key,')');
		var self = this;
		if (self.config) {
			defaultValue = defaultValue || 0;
			return self.config[key] || defaultValue;
		}
	}
};

/**
 *
 */
BNC.Layout = {
	/**
	 * Currently active layout
	 */
	activeLayout: null,

	/**
	 * Tabs to switch between layouts
	 */
	layouts: [],

	/**
	 * Sections
	 */
	sections: [],
	inners: [],

	/**
	 *
	 */
	init: function()
	{
		console.log('BNC.Layout.init()');
		var self = this;
		self.build();
	},

	/**
	 * Build up the basic elements for this layout
	 */
	build: function()
	{
		console.log('BNC.Layout.build()');
		var self = this;
		self.header = new Element('header').inject(document.body);
		var ul = new Element('ul#layouts');
		ul.addEvent('click:relay(li)', function(e, el) {
			e.stop();
			self.activate(el.retrieve('index'));
		});
		Array.each(BNC.Layouts, function(layout, index) {
			Array.push(self.layouts, new Element('li').store('index', index).inject(ul));
		});
		self.header.adopt(ul);
		self.sections = [
			new Element('section#html').inject(document.body),
			new Element('section#css').inject(document.body),
			new Element('section#js').inject(document.body),
			new Element('section#result').inject(document.body)
		];
		self.inners = [
			new Element('div.inner').inject(self.sections[0]),
			new Element('div.inner').inject(self.sections[1]),
			new Element('div.inner').inject(self.sections[2]),
			new Element('div.inner').adopt(new Element('iframe')).inject(self.sections[3])
		];
		CodeMirror(self.inners[0], {
			value: document.getElement('script[type=data/html]').get('html'),
			tabMode: 'shift',
			lineNumbers: true,
			matchBrackets: true,
			mode: 'text/html'
		});
		CodeMirror(self.inners[1], {
			value: document.getElement('script[type=data/css]').get('text'),
			tabMode: 'shift',
			lineNumbers: true,
			matchBrackets: true,
			mode: 'text/css'
		});
		CodeMirror(self.inners[2], {
			value: document.getElement('script[type=data/js]').get('text'),
			tabMode: 'shift',
			lineNumbers: true,
			matchBrackets: true,
			mode: 'text/javascript'
		});
		self.fx = new Fx.Elements(self.sections, {duration: 200});
		self.activate(BNC.getConfig('layout', 0));
	},

	/**
	 * Set layout-specific events
	 */
	setEvents: function()
	{
		console.log('BNC.Layout.setEvents()');
	},

	/**
	 * Activate another layout
	 */
	activate: function(newLayout)
	{
		console.log('BNC.Layout.setLayout(',newLayout,')');
		var self = this;
		if (self.activeLayout !== newLayout) {
			var init = self.activeLayout === null;
			if (!init) {
				if (BNC.Layouts[self.activeLayout]) {
					document.html.removeClass('theme-'+self.activeLayout);
					self.layouts[self.activeLayout].removeClass('active');
					BNC.Layouts[self.activeLayout].deactivate();
				}
			}
			if (BNC.Layouts[newLayout]) {
				document.html.addClass('theme-'+newLayout);
				self.layouts[newLayout].addClass('active');
				BNC.Layouts[newLayout].activate(init);
				self.activeLayout = newLayout;
			}
		}
	}
};

/**
 *
 */
BNC.Layouts = [{
	/**
	 * Handles used by this layout
	 */
	handles: [],

	/**
	 * Drag instances for the handles
	 */
	drags: [],

	/**
	 *
	 */
	dragStart: {
		mouse: null,
		positions: []
	},

	/**
	 *
	 */
	activate: function(init)
	{
		console.log('BNC.Layouts[0].ativate()');
		console.log('init: ', init);
		var self = this,
			h = BNC.Layout.header,
			wSize = window.getSize(),
			hSize = h.getSize(),
			bSize = {x: wSize.x, y: wSize.y - hSize.y},
			opw = bSize.x / 100,
			oph = bSize.y / 100;
		var dimensions = {
			0: {
				top: hSize.y,
				left: 0,
				width: Math.ceil(opw*33),
				height: Math.ceil(oph*50)
			},
			1: {
				top: hSize.y + Math.ceil(oph*50),
				left: 0,
				width: Math.ceil(opw*33),
				height: wSize.y - (hSize.y + Math.ceil(oph*50))
			},
			2: {
				top: hSize.y,
				left: Math.ceil(opw*33),
				width: Math.ceil(opw*34),
				height: wSize.y - hSize.y
			},
			3: {
				top: hSize.y,
				left: Math.ceil(opw*67),
				width: wSize.x - (Math.ceil(opw*67)),
				height: wSize.y - hSize.y
			}
		};
		if (init) {
			BNC.Layout.fx.set(dimensions);
			document.body.set('morph', {duration: 200}).setStyle('opacity', 0).morph({'opacity': 1});
			self.build();
		} else {
			BNC.Layout.fx.start(dimensions).chain(function() {
				self.build();
			});
		}
	},

	/**
	 *
	 */
	deactivate: function()
	{
		console.log('BNC.Layouts[0].deactivate()');
		var self = this;
		self.handles.dispose();
	},

	/**
	 * Build layout-specific elements
	 */
	build: function()
	{
		console.log('BNC.Layouts[0].build()');
		var self = this;
		if (self.handles.length === 0) {
			self.handles = new Elements([
				new Element('div.handle.h1').store('handleId', 0),
				new Element('div.handle.h2').store('handleId', 1),
				new Element('div.handle.h3').store('handleId', 2)
			]).addEvent('mousedown', function(e) {
				self.handleDragStart(e, e.target);
			});
		}
		self.recalibrate();
	},

	/**
	 * Recalibrate element positions/sizes
	 */
	recalibrate: function()
	{
		console.log('BNC.Layouts[0].recalibrate()');
		var self = this,
			inners = BNC.Layout.inners,
			htmlSize = inners[0].getSize(),
			htmlPos = inners[0].getPosition(),
			jsSize = inners[2].getSize(),
			jsPos = inners[2].getPosition(),
			resultSize = inners[3].getSize(),
			resultPos = inners[3].getPosition();
		self.handles[0].setStyles({
			top: htmlSize.y + htmlPos.y,
			left: htmlPos.x,
			width: htmlSize.x,
			height: 8
		});
		self.handles[1].setStyles({
			top: jsPos.y,
			left: htmlPos.x + htmlSize.x,
			width: 8,
			height: jsSize.y
		});
		self.handles[2].setStyles({
			top: jsPos.y,
			left: jsPos.x + jsSize.x,
			width: 8,
			height: jsSize.y
		});

		self.handles.inject(document.body);
	},

	/**
	 *
	 */
	handleDragStart: function(e, el) {
		var self = this;
		e.stop();
		self.dragStart.mouse = e.client;

		//self.dragStart.positions;

		// Drag events
		var mousemove = function(e, el) {
			self.handleDrag(e, el);
		};
		var mouseup = function(e) {
			console.log('let go');
			document.removeEvents({
				mousemove: mousemove,
				mouseup: mouseup
			});
			self.handleDragEnd(e, el);
		};
		document.addEvents({
			mousemove: mousemove,
			mouseup: mouseup
		});
	},

	/**
	 *
	 */
	handleDrag: function(e, el)
	{
		console.log('handle drag', e, el);
	},

	/**
	 *
	 */
	handleDragEnd: function(e, el)
	{
		console.log('drag end', e, el);
	}
},{

	handles: [],

	/**
	 *
	 */
	activate: function(init)
	{
		console.log('BNC.Layouts[1].activate()');
		var self = this,
			h = BNC.Layout.header,
			wSize = window.getSize(),
			hSize = h.getSize(),
			bSize = {x: wSize.x, y: wSize.y - hSize.y},
			opw = bSize.x / 100,
			oph = bSize.y / 100;
		var dimensions = {
			0: {
				top: hSize.y,
				left: 0,
				width: Math.ceil(opw*25),
				height: bSize.y
			},
			1: {
				top: hSize.y,
				left: Math.ceil(opw*25),
				width: Math.ceil(opw*25),
				height: bSize.y
			},
			2: {
				top: hSize.y,
				left: Math.ceil(opw*50),
				width: Math.ceil(opw*25),
				height: bSize.y
			},
			3: {
				top: hSize.y,
				left: Math.ceil(opw*75),
				width: bSize.x - Math.ceil(opw*75),
				height: bSize.y
			}
		};
		if (init) {
			BNC.Layout.fx.set(dimensions);
			self.build();
		} else {
			BNC.Layout.fx.start(dimensions).chain(function() {
				self.build();
			});
		}
	},

	/**
	 *
	 */
	deactivate: function()
	{
		console.log('BNC.Layouts[1].deactivate()');
		var self = this;
		self.handles.dispose();
	},

	/**
	 * Build layout-specific elements
	 */
	build: function()
	{
		var self = this;
		if (self.handles.length === 0) {
			self.handles = new Elements();
			Array.push(
				self.handles,
				new Element('div.handle.h1'),
				new Element('div.handle.h2'),
				new Element('div.handle.h3')
			);
		}
		var inners = BNC.Layout.inners,
			htmlSize = inners[0].getSize(),
			htmlPos = inners[0].getPosition(),
			cssSize = inners[1].getSize(),
			cssPos = inners[1].getPosition(),
			jsSize = inners[2].getSize(),
			jsPos = inners[2].getPosition();
		self.handles[0].setStyles({
			top: htmlPos.y,
			left: htmlPos.x + htmlSize.x,
			width: 8,
			height: htmlSize.y
		});
		self.handles[1].setStyles({
			top: cssPos.y,
			left: cssPos.x + cssSize.x,
			width: 8,
			height: cssSize.y
		});
		self.handles[2].setStyles({
			top: jsPos.y,
			left: jsPos.x + jsSize.x,
			width: 8,
			height: jsSize.y
		});
		self.handles.inject(document.body);
	}
},{

	handles: [],

	/**
	 *
	 */
	activate: function(init)
	{
		console.log('BNC.Layouts[2].activate()');
		var self = this,
			h = BNC.Layout.header,
			wSize = window.getSize(),
			hSize = h.getSize(),
			bSize = {x: wSize.x, y: wSize.y - hSize.y},
			opw = bSize.x / 100,
			oph = bSize.y / 100;
		var dimensions = {
			0: {
				top: hSize.y,
				left: 0,
				width: Math.ceil(opw*50),
				height: Math.ceil(oph*30)
			},
			1: {
				top: hSize.y,
				left: Math.ceil(opw*50),
				width: bSize.x - Math.ceil(opw*50),
				height: Math.ceil(oph*30)
			},
			2: {
				top: hSize.y + Math.ceil(oph*30),
				left: 0,
				width: Math.ceil(opw*50),
				height: bSize.y - Math.ceil(oph*30)
			},
			3: {
				top: hSize.y + Math.ceil(oph*30),
				left: Math.ceil(opw*50),
				width: bSize.x - Math.ceil(opw*50),
				height: bSize.y - Math.ceil(oph*30)
			}
		};
		if (init) {
			BNC.Layout.fx.set(dimensions);
			self.build();
		} else {
			BNC.Layout.fx.start(dimensions).chain(function() {
				self.build();
			});
		}
	},

	/**
	 *
	 */
	deactivate: function()
	{
		console.log('BNC.Layouts[2].deactivate()');
		var self = this;
		self.handles.dispose();
	},

	/**
	 *
	 */
	build: function()
	{
		var self = this;
		if (self.handles.length === 0) {
			self.handles = new Elements();
			Array.push(
				self.handles,
				new Element('div.handle.h1'),
				new Element('div.handle.h2'),
				new Element('div.handle.h3')
			);
		}
		var inners = BNC.Layout.inners,
			htmlSize = inners[0].getSize(),
			htmlPos = inners[0].getPosition(),
			cssSize = inners[1].getSize(),
			cssPos = inners[1].getPosition(),
			jsSize = inners[2].getSize(),
			jsPos = inners[2].getPosition();
		self.handles[0].setStyles({
			top: htmlPos.y + htmlSize.y,
			left: htmlPos.x,
			width: htmlSize.x,
			height: 8
		});
		self.handles[1].setStyles({
			top: htmlPos.y,
			left: htmlPos.x + htmlSize.x,
			width: 8,
			height: (jsPos.y + jsSize.y) - htmlPos.y
		});
		self.handles[2].setStyles({
			top: cssPos.y + cssSize.y,
			left: cssPos.x,
			width: cssSize.x,
			height: 8
		});
		self.handles.inject(document.body);
	}
},{
	handles: [],
	activeSection: null,
	tabWrapper: null,
	tabs: [],

	/**
	 *
	 */
	activate: function(init)
	{
		console.log('BNC.Layouts[3].activate()');
		var self = this,
			h = BNC.Layout.header,
			wSize = window.getSize(),
			hSize = h.getSize(),
			bSize = {x: wSize.x, y: wSize.y - hSize.y},
			opw = bSize.x / 100,
			oph = bSize.y / 100;
		var dimensions = {
			0: {
				top: hSize.y,
				left: 0,
				width: Math.ceil(opw*50),
				height: bSize.y
			},
			1: {
				top: hSize.y,
				left: 0,
				width: Math.ceil(opw*50),
				height: bSize.y
			},
			2: {
				top: hSize.y,
				left: 0,
				width: Math.ceil(opw*50),
				height: bSize.y
			},
			3: {
				top: hSize.y,
				left: Math.ceil(opw*50),
				width: bSize.x - Math.ceil(opw*50),
				height: bSize.y
			}
		};
		if (init) {
			BNC.Layout.fx.set(dimensions);
			self.build();
		} else {
			BNC.Layout.fx.start(dimensions).chain(function() {
				self.build();
			});
		}
	},

	/**
	 *
	 */
	deactivate: function()
	{
		console.log('BNC.Layouts[3].deactivate()');
		var self = this;
		self.handles.dispose();
		self.tabWrapper.dispose();
	},

	/**
	 *
	 */
	build: function()
	{
		var self = this;
		// Tabs
		if (self.tabWrapper === null) {
			self.tabWrapper = new Element('ul#tabs').addEvent('click:relay(li)', function(e, el) {
				e.stop();
				self.displaySection(el.retrieve('index'));
			});
			self.tabs = new Elements();
			Array.forEach(['html', 'css', 'js'], function(section, index) {
				self.tabs.push(new Element('li')
					.store('section', section)
					.store('index', index)
					.inject(self.tabWrapper));
			});
			self.displaySection(0);
		}
		self.tabWrapper.inject(BNC.Layout.header);

		if (self.handles.length === 0) {
			self.handles = new Elements();
			Array.push(
				self.handles,
				new Element('div.handle.h1')
			);
		}
		var inners = BNC.Layout.inners,
			htmlSize = inners[0].getSize(),
			htmlPos = inners[0].getPosition();
		self.handles[0].setStyles({
			top: htmlPos.y,
			left: htmlPos.x + htmlSize.x,
			width: 8,
			height: htmlSize.y
		});
		self.handles.inject(document.body);
	},

	/**
	 *
	 */
	displaySection: function(index)
	{
		var self = this;
		if (self.activeSection !== null) {
			self.tabs[self.activeSection].removeClass('active');
			BNC.Layout.sections[self.activeSection].setStyle('z-index', 1);
		}
		self.tabs[index].addClass('active');
		BNC.Layout.sections[index].setStyle('z-index', 2);
		self.activeSection = index;
	}
}];

BNC.Result = {
	/**
	 *
	 */
};
