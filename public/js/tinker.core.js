/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

/*jsl:ignoreall*/
/**
 * console.log wrapper
 */
window.log = function()
{
	if (window.console) {
		console.log.apply(console, Array.prototype.slice.call(arguments));
	}
};

/**
 *
 */
Element.Events.outerclick = {

	onAdd: function(fn){
		var el = this,
			listener = el.retrieve('outerclick:listener');

		if (listener) return;

		listener = function(e){
			var target = e.target;
			if (target != el && !el.contains(target)) el.fireEvent('outerclick', e);
		};
		document.id(document.body).addEvent('click', listener);
		el.store('outerclick:listener', listener);
	},

	onRemove: function(fn){
		var el = this,
			listener = el.retrieve('outerclick:listener');
		if (!listener) return;
		document.id(document.body).removeEvent('click', listener);
	}
};

/**
 *
 */
Element.Properties.children = {
	set: function(items) {
		if (!Type.isEnumerable(items)) items = Array.from(items);
		this.adopt(items);
		return this;
	}
};

/**
 * Create a closure for private stuff
 */
!function() {

/**
 * Make this stuff public
 */
Tinker.init = function(config)
{
	TP.Events.fireEvent('init', config);
}



/**
 * Private namespace
 */
var TP = {};



/**
 *
 */
TP.Events = new Events;



/**
 *
 */
TP.Core = {
	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('init', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function(config)
	{
		// log('TP.Core.init(', config, ');');
	}
};
TP.Core.prepare();



/**
 *
 */
TP.Tinker = {
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
	prepare: function()
	{
		TP.Events.addEvent('init', this.init.bind(this));
	},

	/**
	 * Store data for the current tinker
	 */
	init: function(config)
	{
		// log('TP.Tinker.init(', config, ');');

		this.properties = JSON.parse(document.getElement('script[type=tinker/properties]').get('html'));
		this.markup = document.getElement('script[type=tinker/markup]').get('html');
		this.style = document.getElement('script[type=tinker/style]').get('html');
		this.interaction = document.getElement('script[type=tinker/interaction]').get('html');

		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Tinker.build();');

		if (this.properties.hash) {
			TP.Events.addEvent('settings.build', this.run.bind(this));
		}

		var self = this;
		var buttons = $$(
			new Element('a.button.run[href=#run][text=Run]'),
			new Element('a.button.save[href=#save][text=Save]')
		).map(function(el) {
			return new Element('li').adopt(el);
		});

		TP.Layout.addToRegion(new Element('ul.buttons', {
			children: buttons,
			events: {
				click: function(e) {
					e.preventDefault();
					var href = e.target.get('href');
					if (href === '#run') {
						self.run();
					} else if (href === '#save') {
						self.save();
					}
				}
			}
		}), 'tr');
	},

	/**
	 * Get properties for current tinker
	 */
	getProperties: function()
	{
		// log('TP.Tinker.getProperties();');

		return this.properties;
	},

	/**
	 * Get markup for current tinker
	 */
	getMarkup: function()
	{
		// log('TP.Tinker.getMarkup();');

		return this.markup;
	},

	/**
	 * Get style for current tinker
	 */
	getStyle: function()
	{
		// log('TP.Tinker.getStyle();');

		return this.style;
	},

	/**
	 * Get interaction for current tinker
	 */
	getInteraction: function()
	{
		// log('TP.Tinker.getInteraction();');

		return this.interaction;
	},

	/**
	 * Run the current tinker in the result frame
	 */
	run: function()
	{
		log('TP.Tinker.run();');

		TP.Events.fireEvent('tinker.save');
		TP.Layout.wrapper.submit();
	},

	/**
	 * Save the current tinker
	 */
	save: function()
	{
		log('TP.Tinker.save();');

		TP.Events.fireEvent('tinker.save');
		TP.Layout.wrapper.submit();

		var self = this;
		var url = '/save';
		if (this.properties.hash) {
			url += '/'+this.properties.hash;
		}
		new Request.JSON({
			url: url,
			data: TP.Layout.wrapper,
			method: 'post',
			onSuccess: function(response) {
				if (!response.hash) {
					return;
				}
				self.properties.hash = response.hash;
				var url = '/'+response.hash;
				if (response.revision) {
					url += '/'+response.revision;
					self.properties.revision = response.revision;
				}
				// Check for history api
				if (!!(window.history && history.pushState)) {
					history.pushState(null, null, url);
				} else {
					window.location = url;
				}
			}
		}).send();
	}
};
TP.Tinker.prepare();



/**
 *
 */
TP.Settings = {
	/**
	 * Available frameworks
	 */
	frameworks: [],
	/**
	 * Available framework versions
	 */
	versions: {},

	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('init', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		log('TP.Settings.init();');

		var self = this;
		this.frameworks = JSON.parse(document.getElement('script[type=frameworks]').get('html'));
		Array.each(this.frameworks, function(framework) {
			Array.each(framework.versions, function(version) {
				version.x_framework_id = framework.id;
				self.versions[version['id']] = version;
			});
		});

		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		log('TP.Settings.build();');

		var self = this, settingsButton;
		TP.Layout.addToRegion(new Element('ul.buttons', {
			children: new Element('li', {
				children: settingsButton = new Element('a.button.settings[href=#settings][text=Settings]')
			})
		}), 'tl');

		var input_doctype, input_framework, input_normalize;
		var settingsContents = new Element('fieldset', {
			children: new Element('ul', {
				children: [
					new Element('li', {
						children: [
							new Element('label[text=Doctype]'),
							new Element('span.input', {
								children: input_doctype = new Element('select[name=doctype]')
							})
						]
					}),
					new Element('li', {
						children: [
							new Element('label[text=Framework]'),
							new Element('span.input', {
								children: input_framework = new Element('select[name=framework]')
							})
						]
					}),
					new Element('li', {
						children: [
							new Element('label').set('text', 'Normalize.css'),
							new Element('span.input', {
								children: input_normalize = new Element('input[name=normalize][type=checkbox][checked]')
							})
						]
					})
				]
			})
		}).adopt();

		input_doctype.adopt(
			new Element('option', {text: 'HTML 5'}),
			new Element('option', {text: 'HTML 4.01 Strict'}),
			new Element('option', {text: 'HTML 4.01 Transitional'}),
			new Element('option', {text: 'HTML 4.01 Frameset'}),
			new Element('option', {text: 'XHTML 1.0 Strict'}),
			new Element('option', {text: 'XHTML 1.0 Transitional'})
		);

		Array.each(this.frameworks, function(framework) {
			var optgroup = new Element('optgroup', {label: framework.name, value: framework.id});
			Array.each(framework.versions, function(version) {
				var option = new Element('option', {text: framework.name+' '+version.name, value: version.id});
				optgroup.adopt(option);
			});
			input_framework.adopt(optgroup);
		});

		input_framework.addEvent('change', function(e) {
			var selected = self.versions[input_framework.getSelected()[0].get('value')];
			if (selected.extensions && selected.extensions.length) {
				console.log('extensions: ', selected.extensions);
			}
		});

		new TP.Popover(settingsContents, {button: settingsButton});

		TP.Events.fireEvent('settings.build');
	}
};
TP.Settings.prepare();



/**
 *
 */
TP.Assets = {
	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('init', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		log('TP.Assets.init();');

		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		log('TP.Assets.build();');
		var assetButton;
		TP.Layout.addToRegion(new Element('ul.buttons', {
			children: new Element('li', {
				children: assetButton = new Element('a.button.assets[href=#assets][text=Assets]')
			})
		}), 'tl');

		var assetContents = new Element('fieldset', {
			children: new Element('ul', {
				children: new Element('li', {
					children: new Element('input')
				})
			})
		});
		new TP.Popover(assetContents, {button: assetButton});
	}
};
TP.Assets.prepare();



/**
 *
 */
TP.Layout = {
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
	 * Minimum dimensions of a panel
	 *
	 * Includes inner and outer minimum dimensions
	 */
	min: {
		x: 200,
		y: 100,
		ox: 210,
		oy: 110
	},

	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('init', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function(config)
	{
		// log('TP.Layout.init(', config, ');');

		this.build();
	},

	/**
	 * Build basic layout elements shared between layouts
	 */
	build: function()
	{
		// log('TP.Layout.build();');

		var self = this;
		document.body.setStyle('opacity', 0).set('morph', {duration: 250});

		var urls = JSON.parse(document.getElement('script[type=urls]').get('html'));
		this.wrapper = new Element('form#wrapper', {
			method: 'post',
			action: urls.sandbox,
			target: 'sandbox'
		}).inject(document.body);

		this.header = new Element('header').inject(this.wrapper);
		this.body = new Element('div#body').inject(this.wrapper);
		this.footer = new Element('footer').inject(this.wrapper);

		this.regions = {
			tl: new Element('div.region.tl').inject(this.header),
			tr: new Element('div.region.tr').inject(this.header),
			bl: new Element('div.region.bl').inject(this.footer),
			bm: new Element('div.region.bm').inject(this.footer),
			br: new Element('div.region.br').inject(this.footer)
		};

		var layoutSelector = new Element('ul.layouts');
		layoutSelector.addEvent('click', function(e) {
			e.preventDefault();
			var layoutIndex = e.target.retrieve('layoutIndex');
			self.activate(layoutIndex);
		});
		Array.each(TP.Layouts, function(layout, index) {
			layoutSelector.adopt(new Element('li', {
				children: new Element('a.button-layout.ls-'+index).store('layoutIndex', index)
			}));
		});
		this.addToRegion(layoutSelector, 'bm');

		this.panels = [
			new TP.Panel(this.body, 0),
			new TP.Panel(this.body, 1),
			new TP.Panel(this.body, 2),
			new TP.Panel(this.body, 3)
		];

		var els = this.panels.map(function(p) { return p.getOuter(); });
		this.fx = new Fx.Elements(els, {duration: 200});
		this.activate(0, true);
		TP.Events.fireEvent('layout.build');
	},

	/**
	 * Activate a layout by index
	 */
	activate: function(index, init)
	{
		// log('TP.Layout.activate();');

		if (index !== this.curLayout) {
			var init = this.curLayout === null;

			if (init && !TP.Layouts[index]) {
				index = 0;
			}

			if (!init && TP.Layouts[this.curLayout]) {
				document.html.removeClass('layout-'+this.curLayout);
				TP.Layouts[this.curLayout].deactivate();
			}

			if (TP.Layouts[index]) {
				document.html.addClass('layout-'+index);
				TP.Layouts[index].activate(init);
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

TP.Layout.prepare();



/**
 * A collection of existing layouts
 */
TP.Layouts = [];



/**
 * Default layout
 */
TP.Layouts.push({
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
	 * Bound functions
	 */
	bound: {},
	/**
	 * Store stuff during a drag
	 */
	dragOpts: {},

	/**
	 * Activate this layout
	 */
	activate: function(init)
	{
		log('TP.Layouts[0].activate();');

		this.bound.resize = this.resize.bind(this);
		window.addEvent('resize', this.bound.resize);

		var relativeSizes = localStorage['layout0Sizes'];
		if (relativeSizes) {
			this.relativeSizes = JSON.parse(relativeSizes);
		}

		var dimensions = this.getDimensions();
		if (init) {
			TP.Layout.fx.set(dimensions);
			document.body.morph({opacity: [0, 1]});
			this.build();
			this.recalibrate();
		} else {
			var self = this;
			TP.Layout.fx.start(dimensions).chain(function() {
				self.build();
				self.recalibrate();
			});
		}
	},

	/**
	 * Deactivate this layout
	 */
	deactivate: function()
	{
		log('TP.Layouts[0].deactivate();');

		this.handles.dispose();
		window.removeEvent('resize', this.bound.resize);
	},

	/**
	 * Get dimensions for panels based on passed relative sizes
	 */
	getDimensions: function()
	{
		// log('TP.Layouts[0].getDimensions();');

		var rs = this.relativeSizes,
			p = TP.Layout.panels,
			bSize = TP.Layout.body.getSize(),
			min = TP.Layout.min,
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
	},

	/**
	 * Build up any additional element required for this layout
	 */
	build: function()
	{
		// log('TP.Layouts[0].build();');

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

		this.handles.inject(TP.Layout.body);
	},

	/**
	 * Recalibrate handle positions/sizes
	 */
	recalibrate: function()
	{
		// log('TP.Layouts[0].recalibrate()');

		var p = TP.Layout.panels,
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
	 * Handle starting drag
	 */
	dragStart: function(e, handle)
	{
		// log('TP.Layouts[0].dragStart(', e, handle, ');');

		e.stop();
		var p = TP.Layout.panels, d = this.dragOpts, p1, p2;

		d.handle = handle;
		d.handleId = handle.retrieve('handleId');
		d.handlePos = handle.getPosition(TP.Layout.body),
		d.handleSize = handle.getSize();
		d.mousePos = e.client;

		TP.Events.fireEvent('layout.dragStart');

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

		this.bound.mousemove = this.drag.bind(this);
		this.bound.mouseup = this.dragEnd.bind(this);

		document.addEvents({
			mousemove: this.bound.mousemove,
			mouseup: this.bound.mouseup
		});
	},

	/**
	 *
	 */
	drag: function(e)
	{
		// log('TP.Layouts[0].drag(', e, ');');

		var p = TP.Layout.panels,
			d = this.dragOpts,
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
			this.handles[0].setStyle('width', x - 5);
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
	},

	/**
	 * Drag end event
	 */
	dragEnd: function(e)
	{
		// log('TP.Layouts[0].dragEnd(', e, ');');

		TP.Events.fireEvent('layout.dragEnd');
		document.removeEvents({
			mousemove: this.bound.mousemove,
			mouseup: this.bound.mouseup
		});
		this.storeSizes();
	},

	/**
	 * Handle window resizing
	 */
	resize: function()
	{
		// log('TP.Layouts[0].resize();');

		var dimensions = this.getDimensions();
		TP.Layout.fx.set(dimensions);
		this.recalibrate();
	},

	/**
	 * Store relative sizes of elements
	 */
	storeSizes: function()
	{
		log('TP.Layouts[0.storeSizes();');

		var p = TP.Layout.panels,
			bSize = TP.Layout.body.getSize(),
			opw = bSize.x / 100,
			oph = bSize.y / 100,
			p0Size = p[0].getOuter().getSize(),
			p1Size = p[1].getOuter().getSize(),
			p2Size = p[2].getOuter().getSize(),
			p3Size = p[3].getOuter().getSize();

		this.relativeSizes = [
			{x: Math.floor(p0Size.x/opw), y: Math.floor(p0Size.y/oph)},
			{x: Math.floor(p1Size.x/opw), y: 0},
			{x: Math.floor(p2Size.x/opw), y: 100},
			{x: 0, y: 100}
		];
		localStorage['layout0Sizes'] = JSON.stringify(this.relativeSizes);
	}
});



/**
 * Default layout
 */
TP.Layouts.push({
	/**
	 * Drag handles
	 */
	handles: [],
	/**
	 * Relative size of the panels
	 */
	relativeSizes: [
		{x: 50, y: 33},
		{x: 50, y: 33},
		{x: 50, y: 33},
		{x: 0, y: 100}
	],
	/**
	 * Bound functions
	 */
	bound: {},
	/**
	 * Store stuff during a drag
	 */
	dragOpts: {},

	/**
	 * Activate this layout
	 */
	activate: function(init)
	{
		log('TP.Layouts[1].activate();');

		this.bound.resize = this.resize.bind(this);
		window.addEvent('resize', this.bound.resize);

		var relativeSizes = localStorage['layout1Sizes'];
		if (relativeSizes) {
			this.relativeSizes = JSON.parse(relativeSizes);
		}

		var dimensions = this.getDimensions();
		if (init) {
			TP.Layout.fx.set(dimensions);
			document.body.morph({opacity: [0, 1]});
			this.build();
			this.recalibrate();
		} else {
			var self = this;
			TP.Layout.fx.start(dimensions).chain(function() {
				self.build();
				self.recalibrate();
			});
		}
	},

	/**
	 * Deactivate this layout
	 */
	deactivate: function()
	{
		log('TP.Layouts[1].deactivate();');

		this.handles.dispose();
		window.addEvent('resize', this.bound.resize);
	},

	/**
	 * Get dimensions for panels based on passed relative sizes
	 */
	getDimensions: function()
	{
		// log('TP.Layouts[1].getDimensions();');

		var rs = this.relativeSizes,
			p = TP.Layout.panels,
			bSize = TP.Layout.body.getSize(),
			min = TP.Layout.min,
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
			height: Math.ceil(oph * rs[1].y)
		};
		d[1].width = d[1].width < min.ox ? min.ox : d[1].width;
		d[1].height = d[1].height < min.oy ? min.oy : d[1].height;
		d[2] = {
			top: d[0].height + d[1].height,
			left: 0,
			width: Math.ceil(opw * rs[2].x),
			height: bSize.y - d[1].height - d[0].height
		};
		d[2].width = d[2].width < min.ox ? min.ox : d[2].width;
		d[3] = {
			top: 0,
			left: d[0].width,
			width: bSize.x - d[0].width,
			height: bSize.y
		};

		return d;
	},

	/**
	 * Build up any additional element required for this layout
	 */
	build: function()
	{
		// log('TP.Layouts[1].build();');

		if (this.handles.length === 0) {
			var self = this;
			this.handles = new Elements([
				new Element('div.handle.horz.h1').store('handleId', 0),
				new Element('div.handle.horz.h2').store('handleId', 1),
				new Element('div.handle.vert.h3').store('handleId', 2)
			]).addEvent('mousedown', function(e) {
				self.dragStart(e, e.target);
			});
		}

		this.handles.inject(TP.Layout.body);
	},

	/**
	 * Recalibrate handle positions/sizes
	 */
	recalibrate: function()
	{
		// log('TP.Layouts[1].recalibrate()');

		var p = TP.Layout.panels,
			p0 = p[0].getCoords(),
			p1 = p[1].getCoords(),
			p3 = p[3].getCoords();

		this.handles[0].setStyles({
			top: p0.y2,
			left: p0.x1,
			width: p0.x2 - p0.x1
		});
		this.handles[1].setStyles({
			top: p1.y2,
			left: p1.x1,
			width: p1.x2 - p1.x1
		});
		this.handles[2].setStyles({
			top: p0.y1,
			left: p0.x2,
			height: p3.y2 - p3.y1
		});
	},

	/**
	 * Handle starting drag
	 */
	dragStart: function(e, handle)
	{
		// log('TP.Layouts[1].dragStart(', e, handle, ');');

		e.stop();
		var p = TP.Layout.panels, d = this.dragOpts, p1, p2;

		d.handle = handle;
		d.handleId = handle.retrieve('handleId');
		d.handlePos = handle.getPosition(TP.Layout.body),
		d.handleSize = handle.getSize();
		d.mousePos = e.client;

		TP.Events.fireEvent('layout.dragStart');

		switch (d.handleId) {
			case 0: p1 = p[0].getCoords(); p2 = p[1].getCoords(); break;
			case 1: p1 = p[1].getCoords(); p2 = p[2].getCoords(); break;
			case 2: p1 = p[0].getCoords(); p2 = p[3].getCoords(); break;
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

		this.bound.mousemove = this.drag.bind(this);
		this.bound.mouseup = this.dragEnd.bind(this);

		document.addEvents({
			mousemove: this.bound.mousemove,
			mouseup: this.bound.mouseup
		});
	},

	/**
	 *
	 */
	drag: function(e)
	{
		// log('TP.Layouts[1].drag(', e, ');');

		var p = TP.Layout.panels,
			d = this.dragOpts,
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
				height: d.box.y2 - y
			});
		} else if (d.handleId === 1) {
			p[1].getOuter().setStyle('height', (y - d.box.y1) + 10);
			p[2].getOuter().setStyles({
				top: y + 5,
				height: d.box.y2 - y
			});
		} else if (d.handleId === 2) {
			p[0].getOuter().setStyle('width', x + 5);
			p[1].getOuter().setStyle('width', x + 5);
			p[2].getOuter().setStyle('width', x + 5);
			this.handles[0].setStyle('width', x - 5);
			this.handles[1].setStyle('width', x - 5);
			p[3].getOuter().setStyles({
				left: x + 5,
				width: d.box.x2 - x
			});
		}
	},

	/**
	 * Drag end event
	 */
	dragEnd: function(e)
	{
		// log('TP.Layouts[1].dragEnd(', e, ');');

		TP.Events.fireEvent('layout.dragEnd');
		document.removeEvents({
			mousemove: this.bound.mousemove,
			mouseup: this.bound.mouseup
		});
		this.storeSizes();
	},

	/**
	 * Handle window resizing
	 */
	resize: function()
	{
		// log('TP.Layouts[1].resize();');

		var dimensions = this.getDimensions();
		TP.Layout.fx.set(dimensions);
		this.recalibrate();
	},

	/**
	 *
	 */
	storeSizes: function()
	{
		// log('TP.Layouts[1].storeSizes();');

		var p = TP.Layout.panels,
			bSize = TP.Layout.body.getSize(),
			opw = bSize.x / 100,
			oph = bSize.y / 100,
			p0Size = p[0].getOuter().getSize(),
			p1Size = p[1].getOuter().getSize(),
			p2Size = p[2].getOuter().getSize(),
			p3Size = p[3].getOuter().getSize();

		this.relativeSizes = [
			{x: Math.floor(p0Size.x/opw), y: Math.floor(p0Size.y/oph)},
			{x: Math.floor(p1Size.x/opw), y: Math.floor(p1Size.y/oph)},
			{x: Math.floor(p2Size.x/opw), y: 0},
			{x: 0, y: 100}
		];
		localStorage['layout1Sizes'] = JSON.stringify(this.relativeSizes);
	}
});



/**
 * Create a panel which can hold result/editor frames
 */
TP.Panel = new Class({
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
		// log('TP.Panel.initialize(', wrapper, index, ');');

		this.wrapper = wrapper;
		this.outer = new Element('section#panel'+index).inject(this.wrapper);
		this.inner = new Element('div.inner').inject(this.outer);
	},

	/**
	 * Retrieve the panel's outer element
	 */
	getOuter: function()
	{
		// log('TP.Panel.getOuter();', this.outer);

		return this.outer;
	},

	/**
	 * Retrieve the panel's inner element
	 */
	getInner: function()
	{
		// log('TP.Panel.getInner();');

		return this.inner;
	},

	/**
	 * Get coords for a panel's inner element, relative to the wrapper
	 */
	getCoords: function(outer)
	{
		// log('TP.Panel.getCoords();');

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
TP.Editor = {
	/**
	 * Keep track of the active line
	 */
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
		theme: 'tinker-light' //,
		// onCursorActivity: function() {
		// 	console.log('cursor activity', this, self);
		// 	editor.setLineClass(hlLine, null);
		// 	hlLine = editor.setLineClass(editor.getCursor().line, "activeline");
		// }
		// var hlLine = editor.setLineClass(0, "activeline");
	},

	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('layout.build', this.init.bind(this));
		TP.Events.addEvent('tinker.save', this.save.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		// log('TP.Editor.init();');

		this.build();
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Editor.build();');
	},

	/**
	 * Copy codemirror contents to it's textarea
	 */
	save: function()
	{
		if (this.codemirror) {
			this.codemirror.save();
		}
	}
};



/**
 *
 */
TP.MarkupEditor = Object.merge({}, TP.Editor, {
	/**
	 *
	 */
	build: function()
	{
		// log('TP.MarkupEditor.build();');

		var panel = TP.Layout.getPanel(0);
		if (panel) {
			this.frame = new Element('div.frame');
			this.textarea = new Element('textarea', {
				name: 'markup',
				html: TP.Tinker.getMarkup()
			});
			this.frame.adopt(this.textarea).inject(panel.getInner());
			var options = Object.append({mode: 'text/html'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
		}
	}
});
TP.MarkupEditor.prepare();



/**
 *
 */
TP.StyleEditor = Object.merge({}, TP.Editor, {
	/**
	 *
	 */
	build: function()
	{
		// log('TP.MarkupEditor.build();');

		var panel = TP.Layout.getPanel(1);
		if (panel) {
			this.frame = new Element('div.frame');
			this.textarea = new Element('textarea', {
				name: 'style',
				html: TP.Tinker.getStyle()
			});
			this.frame.adopt(this.textarea).inject(panel.getInner());
			var options = Object.append({mode: 'text/css'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
		}
	}
});
TP.StyleEditor.prepare();



/**
 *
 */
TP.InteractionEditor = Object.merge({}, TP.Editor, {
	/**
	 *
	 */
	build: function()
	{
		// log('TP.MarkupEditor.build();');

		var panel = TP.Layout.getPanel(2);
		if (panel) {
			this.frame = new Element('div.frame');
			this.textarea = new Element('textarea', {
				name: 'interaction',
				html: TP.Tinker.getInteraction()
			});
			this.frame.adopt(this.textarea).inject(panel.getInner());
			var options = Object.append({mode: 'text/javascript'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
		}
	}
});
TP.InteractionEditor.prepare();



/**
 *
 */
TP.Result = {
	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('layout.build', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		// log('TP.Result.init()');

		TP.Events.addEvent('layout.dragStart', this.showOverlay.bind(this));
		TP.Events.addEvent('layout.dragEnd', this.hideOverlay.bind(this));

		this.build();
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Result.build();');

		var panel = TP.Layout.getPanel(3);
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
		// log('TP.Result.buildOverlay();');

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
		// log('TP.Result.showOverlay();');

		this.buildOverlay();
		this.overlay.inject(this.wrapper);
	},

	/**
	 * Hide the drag overlay
	 */
	hideOverlay: function()
	{
		// log('TP.Result.hideOverlay();');

		this.overlay.dispose();
	}
};
TP.Result.prepare();

/**
 *
 */
TP.Popover = new Class({
	/**
	 *
	 */
	Implements: Options,
	/**
	 *
	 */
	options: {
		button: null
	},
	/**
	 *
	 */
	hidden: true,

	/**
	 *
	 */
	initialize: function(contents, options)
	{
		// log('TP.Popover.initialize(', contents, options, ');');

		this.setOptions(options);
		this.build(contents);
	},

	/**
	 *
	 */
	build: function(contents)
	{
		// log('TP.Popover.build(', contents, ');');

		var self = this,
			offset = {x: 0, y: 0};

		if (this.options.button) {
			var pos = this.options.button.getPosition(),
				size = this.options.button.getSize();
			this.offset = {x: pos.x, y: pos.y + size.y};

			this.options.button.addEvent('click', function(e) {
				e.preventDefault();
				self.toggle();
			});
		}

		this.element = new Element('div.popover', {
			children: [
				new Element('div.popover-arrow'),
				new Element('div.popover-content', {children: contents})
			],
			morph: {
				duration: 150
			},
			styles: {
				top: this.offset.y,
				left: this.offset.x,
				display: 'none'
			},
			events: {
				outerclick: function(e) {
					if (!self.hidden && e.target !== self.options.button) {
						self.hide();
					}
				}
			}
		}).inject(TP.Layout.wrapper);
	},

	/**
	 *
	 */
	show: function()
	{
		// log('TP.Popover.show();');

		this.element.setStyles({
			display: 'block',
			top: this.offset.y - 3,
			opacity: 0
		}).morph({
			top: this.offset.y,
			opacity: 1
		});
		this.hidden = false;
	},

	/**
	 *
	 */
	hide: function()
	{
		// log('TP.Popover.hide();');
		this.element.morph({
			top: this.offset.y - 3,
			opacity: 0
		}).get('morph').chain(function() {
			this.subject.setStyle('display', 'none');
		});
		this.hidden = true;
	},

	/**
	 *
	 */
	toggle: function()
	{
		// log('TP.Popover.toggle();');

		if (this.hidden) {
			this.show();
		} else {
			this.hide();
		}
	}
});

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

