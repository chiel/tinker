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
};



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
		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	init: function(config)
	{
		// log('TP.Core.init(', config, ');');
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Core.build();');

		var aboutButton;
		TP.Layout.addToRegion(new Element('ul.buttons', {
			children: new Element('li', {
				children: aboutButton = new Element('a.button.about[href=#about][text=About]')
			})
		}), 'br');

		var html = '<p>Tinker comes from <a href="https://twitter.com/#!/chielkunkels">@chielkunkels</a> '
			+'and <a href="https://twitter.com/#!/ponjoh">@ponjoh</a>.</p><p>Check out the code on '
			+'<a href="http://git.io/tinker">Github</a> and follow '
			+'<a href="https://twitter.com/#!/tinker_io">@tinker_io</a> on Twitter.</p>';
		var contents = new Element('div#about', {html: html});

		new TP.Popover(contents, {button: aboutButton, anchor: 'br'});
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
	style: null,
	interaction: null,

	//
	inputHash: null,
	inputRevision: null,

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
	init: function()
	{
		// log('TP.Tinker.init(', config, ');');

		var data = JSON.parse(document.getElement('script[type=tinker]').get('html'));
		this.hash = data.hash || null;
		this.revision = data.revision || null;
		this.doctype = data.revision || null;
		this.framework = data.framework || null;
		this.normalize = data.normalize || null;
		this.assets = data.assets || [];
		this.title = data.title || null;
		this.description = data.description || null;
		this.markup = data.markup || null;
		this.style = data.style || null;
		this.interaction = data.interaction || null;

		if (this.hash) {
			TP.Events.addEvent('result.build', this.run.bind(this));
			// @todo only do this when the revision is not in the url yet
			if (!!(window.history && history.pushState)) {
				var url = '/'+this.hash;
				url += this.revision > 0 ? '/'+this.revision : '';
				history.pushState(null, null, url);
			}
		}
		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Tinker.build();');

		var self = this;
		var buttons = $$(
			new Element('a.button.run[href=#run][text=Run]'),
			new Element('a.button.primary.save[href=#save][text=Save]')
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

		TP.Layout.wrapper.adopt(
			this.inputHash = new Element('input[type=hidden]', {name: 'hash', value: this.hash}),
			this.inputRevision = new Element('input[type=hidden]', {name: 'revision', value: this.revision})
		);
	},

	/**
	 * Run the current tinker in the result frame
	 */
	run: function()
	{
		// log('TP.Tinker.run();');

		TP.Events.fireEvent('tinker.save');
		TP.Layout.wrapper.submit();
	},

	/**
	 * Save the current tinker
	 */
	save: function()
	{
		// log('TP.Tinker.save();');

		TP.Events.fireEvent('tinker.save');
		TP.Layout.wrapper.submit();

		var self = this;
		new Request.JSON({
			url: '/save',
			data: TP.Layout.wrapper,
			method: 'post',
			onSuccess: function(response) {
				if (response.status === 'ok') {
					self.hash = response.hash;
					self.revision = response.revision;

					self.inputHash.set('value', self.hash);
					self.inputRevision.set('value', self.revision);

					var url = '/'+self.hash;
					url += self.revision > 0 ? '/'+self.revision : '';

					if (!!(window.history && history.pushState)) {
						history.pushState(null, null, url);
					} else {
						window.location = url;
					}
				} else if (response.status === 'error') {
					log(response.error.message);
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
	 * Tab bar element
	 */
	tabWrapper: null,
	/**
	 *
	 */
	tabs: {},
	/**
	 * Available settings panes
	 */
	panes: {},
	/**
	 *
	 */
	activePane: 'general',

	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Settings.build();');

		var self = this, settingsButton;
		TP.Layout.addToRegion(new Element('ul.buttons', {
			children: new Element('li', {
				children: settingsButton = new Element('a.button.settings[href=#settings][text=Settings]')
			})
		}), 'tl');

		var contents = new Element('div', {
			children: [
				this.tabWrapper = new Element('ul.tabs', {
					children: [
						new Element('li', {children: this.tabs.general = new Element('a.is-active[href=#settings-general]', {text: 'General'})}),
						new Element('li', {children: this.tabs.assets = new Element('a[href=#settings-assets]', {text: 'Assets'})}),
						new Element('li', {children: this.tabs.info = new Element('a[href=#settings-info]', {text: 'Info'})})
					]
				}),
				this.panes.general = new Element('div.settings-general'),
				this.panes.assets = new Element('div.settings-assets.is-hidden'),
				this.panes.info = new Element('div.settings-info.is-hidden')
			]
		});

		this.tabWrapper.addEvent('click', function(e) {
			if (e.target.get('tag') === 'a') {
				e.preventDefault();
				var pane = e.target.get('href').replace(/\#settings-/, '');
				self.tabs[self.activePane].removeClass('is-active');
				self.panes[self.activePane].addClass('is-hidden');
				self.tabs[pane].addClass('is-active');
				self.panes[pane].removeClass('is-hidden');
				self.activePane = pane;
			}
		});

		TP.Events.fireEvent('settings.build');
		new TP.Popover(contents, {button: settingsButton});
	}
};
TP.Settings.prepare();



/**
 *
 */
TP.Settings.General = {
	/**
	 * Available doctypes
	 */
	doctypes: [],
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
		TP.Events.addEvent('settings.build', this.build.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		var self = this;
		this.doctypes = JSON.parse(document.getElement('script[type=doctypes]').get('html'));
		this.frameworks = JSON.parse(document.getElement('script[type=frameworks]').get('html'));
		Array.each(this.frameworks, function(framework) {
			Array.each(framework.versions, function(version) {
				version.x_framework_id = framework.id;
				self.versions[version['id']] = version;
			});
		});
	},

	/**
	 *
	 */
	build: function()
	{
		var input_doctype, input_framework, input_normalize;

		TP.Settings.panes.general.adopt(
			new Element('fieldset', {
				children: new Element('ul', {
					children: [
						new Element('li', {
							children: [
								new Element('label[for=input-doctype][text=Doctype]'),
								new Element('span.input', {
									children: input_doctype = new Element('select[id=input-doctype][name=doctype]')
								})
							]
						}),
						new Element('li', {
							children: [
								new Element('label[for=input-framework][text=Framework]'),
								new Element('span.input', {
									children: input_framework = new Element('select[id=input-framework][name=framework]', {
										children: new Element('option', {text: 'None', value: 0})
									})
								})
							]
						}),
						new Element('li', {
							children: [
								new Element('label[for=input-normalize]', {text: 'Normalize.css'}),
								new Element('span.input', {
									children: input_normalize = new Element('input[id=input-normalize][name=normalize][type=checkbox][checked]')
								})
							]
						})
					]
				})
			})
		);

		if (TP.Tinker.hash && !TP.Tinker.normalize) {
			input_normalize.set('checked', false);
		}

		Array.each(this.doctypes, function(doctype) {
			var option = new Element('option', {text: doctype.name, value: doctype.id});
			input_doctype.adopt(option);
		});

		Array.each(this.frameworks, function(framework) {
			var optgroup = new Element('optgroup', {label: framework.name, value: framework.id});
			Array.each(framework.versions, function(version) {
				var option = new Element('option', {text: framework.name+' '+version.name, value: version.id});
				if (TP.Tinker.framework === version.id) {
					option.set('selected', true);
				}
				optgroup.adopt(option);
			});
			input_framework.adopt(optgroup);
		});

		input_framework.addEvent('change', function(e) {
			// var selected = self.versions[input_framework.getSelected()[0].get('value')];
			// if (selected.extensions && selected.extensions.length) {
			// 	console.log('extensions: ', selected.extensions);
			// }
		});

		TP.Events.fireEvent('settings.general.build');
		TP.Events.fireEvent('general.build');
	}
};
TP.Settings.General.prepare();



/**
 *
 */
TP.Settings.Assets = {
	/**
	 * List of all the assets we've added so far
	 */
	assets: [],
	/**
	 *
	 */
	wrapper: null,
	input: null,
	addButton: null,
	assetList: null,

	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('settings.build', this.build.bind(this));
		TP.Events.addEvent('asset.remove', this.removeAsset.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		var self = this;

		TP.Settings.panes.assets.adopt(
			this.wrapper = new Element('fieldset', {
				children: [
					new Element('ul', {
						children: new Element('li', {
							children: [
								this.input = new Element('input'),
								this.addButton = new Element('a[text=Add][href=#]')
							]
						})
					}),
					this.assetList = new Element('ul#assetList')
				]
			})
		);

		if (TP.Tinker.assets) {
			Array.each(TP.Tinker.assets, function(asset) {
				self.addAsset(asset);
			});
		}

		this.addButton.addEvent('click', function(e) {
			e.preventDefault();
			var url = self.input.get('value').trim();

			self.addAsset(url);
			self.input.set('value', '');
		});
	},

	/**
	 *
	 */
	addAsset: function(url)
	{
		log('TP.Settings.Assets.addAsset(', url, ');');

		if (url === '') {
			return;
		}

		var asset = new TP.Asset(url);
		this.assets.push(asset);
		this.assetList.adopt(asset.element);
	},

	/**
	 *
	 */
	removeAsset: function(asset)
	{
		this.assets.splice(this.assets.indexOf(asset), 1);
		log(this.assets);
	}
};
TP.Settings.Assets.prepare();



/**
 *
 */
TP.Asset = new Class({
	/**
	 *
	 */
	initialize: function(url)
	{
		// log('TP.Asset.initialize(', url, ');');

		this.url = url;
		this.name = this.url.replace(/^.*\/(.+)$/, '$1');
		this.type = this.name.replace(/.*\.([a-z]+)/i, '$1');
		this.element = new Element('li', {
			children: [
				new Element('span', {text: this.name}),
				new Element('a.delete[href=#]').addEvent('click', this.remove.bind(this)),
				new Element('input[type=hidden]', {name: 'assets[]', value: this.url})
			]
		});
	},

	/**
	 *
	 */
	remove: function(e)
	{
		// log('TP.Asset.remove();');

		e.stop();
		this.element.destroy();
		TP.Events.fireEvent('asset.remove', this);
	}
});



/**
 *
 */
TP.Settings.Info = {
	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('settings.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		TP.Settings.panes.info.adopt(
			new Element('fieldset', {
				children: new Element('ul', {
					children: [
						new Element('li', {
							children: [
								new Element('label[for=input-title]', {text: 'Title'}),
								new Element('input[id=input-title][name=title]', {
									value: TP.Tinker.title || ''
								})
							]
						}),
						new Element('li', {
							children: [
								new Element('label[for=input-description]', {text: 'Description'}),
								new Element('textarea[id=input-description][name=description]', {
									value: TP.Tinker.description || ''
								})
							]
						})
					]
				})
			})
		);
	}
};
TP.Settings.Info.prepare();



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
	 * Layout picker element
	 */
	layoutPicker: null,
	/**
	 *
	 */
	layoutArrow: null,
	/**
	 * Layout picker buttons
	 */
	layoutButtons: [],

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

		this.panels = [
			new TP.Panel(this.body, 0),
			new TP.Panel(this.body, 1),
			new TP.Panel(this.body, 2),
			new TP.Panel(this.body, 3)
		];

		var els = this.panels.map(function(p) { return p.getOuter(); });
		this.fx = new Fx.Elements(els, {duration: 200});
		this.buildLayoutPicker();
		this.activate(localStorage['activeLayout'] || 0);
		TP.Events.fireEvent('layout.build');
	},

	/**
	 *
	 */
	buildLayoutPicker: function()
	{
		// log('TP.Layout.buildLayoutPicker();');

		var self = this;
		this.layoutButtons = new Elements();

		Array.each(TP.Layouts, function(layout, index) {
			var anchor = new Element('a.button-layout.ls-'+index, {
				href: '#layout'+index
			}).store('layoutIndex', index);
			self.layoutButtons.push(anchor);
		});

		this.layoutPicker = new Element('div#layoutpicker', {
			children: [
				this.layoutArrow = new Element('div.arrow'),
				new Element('ul', {
					children: this.layoutButtons.map(function(el) { return new Element('li').adopt(el); })
				})
			]
		});
		this.layoutArrow.set('morph', {duration: 150});
		this.layoutPicker.addEvent('click', function(e) {
			e.preventDefault();
			if (e.target.get('tag') === 'a') {
				self.activate(e.target.retrieve('layoutIndex'));
			}
		});
		this.addToRegion(this.layoutPicker, 'bm');
	},

	/**
	 * Activate a layout by index
	 */
	activate: function(index)
	{
		// log('TP.Layout.activate();');

		if (index !== this.curLayout) {
			var init = this.curLayout === null;

			if (init && !TP.Layouts[index]) {
				index = 0;
			}

			if (!init && TP.Layouts[this.curLayout]) {
				this.layoutButtons[this.curLayout].removeClass('active');
				document.html.removeClass('layout-'+this.curLayout);
				TP.Layouts[this.curLayout].deactivate();
			}

			if (TP.Layouts[index]) {
				var pos = this.layoutButtons[index].getPosition(this.layoutPicker),
					size = this.layoutButtons[index].getSize();
				this.layoutArrow.morph({left: (pos.x + (size.x/2) - 5)});
				this.layoutButtons[index].addClass('active');
				document.html.addClass('layout-'+index);
				localStorage['activeLayout'] = index;
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
		// log('TP.Layout.getPanel(', index, ');');

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
		// log('TP.Layout.addToRegion(', node, region, ');');

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
		// log('TP.Layouts[0].activate();');

		this.bound.resize = this.resize.bind(this);
		window.addEvent('resize', this.bound.resize);

		var relativeSizes = localStorage['layout0Sizes'];
		if (relativeSizes) {
			this.relativeSizes = JSON.parse(relativeSizes);
		}

		var dimensions = this.getDimensions();
		if (init) {
			TP.Layout.fx.set(dimensions);
			this.build();
			this.recalibrate();
			TP.Events.fireEvent('layout.activate');
		} else {
			var self = this;
			TP.Layout.fx.start(dimensions).chain(function() {
				self.build();
				self.recalibrate();
				TP.Events.fireEvent('layout.activate');
			});
		}
	},

	/**
	 * Deactivate this layout
	 */
	deactivate: function()
	{
		// log('TP.Layouts[0].deactivate();');

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
		d.handlePos = handle.getPosition(TP.Layout.body);
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
		// log('TP.Layouts[0.storeSizes();');

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
		// log('TP.Layouts[1].activate();');

		this.bound.resize = this.resize.bind(this);
		window.addEvent('resize', this.bound.resize);

		var relativeSizes = localStorage['layout1Sizes'];
		if (relativeSizes) {
			this.relativeSizes = JSON.parse(relativeSizes);
		}

		var dimensions = this.getDimensions();
		if (init) {
			TP.Layout.fx.set(dimensions);
			this.build();
			this.recalibrate();
			TP.Events.fireEvent('layout.activate');
		} else {
			var self = this;
			TP.Layout.fx.start(dimensions).chain(function() {
				self.build();
				self.recalibrate();
				TP.Events.fireEvent('layout.activate');
			});
		}
	},

	/**
	 * Deactivate this layout
	 */
	deactivate: function()
	{
		// log('TP.Layouts[1].deactivate();');

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
		d.handlePos = handle.getPosition(TP.Layout.body);
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
	curLine: 0,
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
		theme: 'tinker-light'
	},

	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('layout.build', this.init.bind(this));
		TP.Events.addEvent('tinker.save', this.save.bind(this));
		TP.Events.addEvent('layout.activate', this.refresh.bind(this));
		TP.Events.addEvent('layout.dragEnd', this.refresh.bind(this));
	},

	/**
	 *
	 */
	init: function()
	{
		// log('TP.Editor.init();');

		var self = this;
		Object.append(this.mirrorOptions, {
			onFocus: this.onFocus.bind(this),
			onBlur: this.onBlur.bind(this),
			onCursorActivity: this.highlightLine.bind(this)
		});
		this.build();
	},

	/**
	 * When the editor gets focussed
	 */
	onFocus: function()
	{
		// log('TP.Editor.onFocus();');

		this.frame.addClass('focussed');
		this.highlightLine();
	},

	/**
	 * When the editor gets blurred
	 */
	onBlur: function()
	{
		// log('TP.Editor.onBlur();');

		this.frame.removeClass('focussed');
	},

	/**
	 *
	 */
	highlightLine: function()
	{
		// log('TP.Editor.highlightLine();');

		this.codemirror.setLineClass(this.curLine, null);
		this.curLine = this.codemirror.getCursor().line;
		this.codemirror.setLineClass(this.curLine, 'active_line');
	},

	/**
	 *
	 */
	refresh: function()
	{
		if (this.codemirror) {
			this.codemirror.refresh();
		}
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
				html: TP.Tinker.markup
			});
			this.settings = new Element('div.settings', {text: 'HTML'});
			this.frame.adopt(this.textarea, this.settings).inject(panel.getInner());
			var options = Object.append({mode: 'text/html'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
			this.highlightLine();
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
				html: TP.Tinker.style
			});
			this.settings = new Element('div.settings', {text: 'CSS'});
			this.frame.adopt(this.textarea, this.settings).inject(panel.getInner());
			var options = Object.append({mode: 'text/css'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
			this.highlightLine();
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
				html: TP.Tinker.interaction
			});
			this.settings = new Element('div.settings', {text: 'JS'});
			this.frame.adopt(this.textarea, this.settings).inject(panel.getInner());
			var options = Object.append({mode: 'text/javascript'}, this.mirrorOptions);
			this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
			this.highlightLine();
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
		log('TP.Result.init()');

		TP.Events.addEvent('layout.dragStart', this.showOverlay.bind(this));
		TP.Events.addEvent('layout.dragEnd', this.hideOverlay.bind(this));

		this.build();
	},

	/**
	 *
	 */
	build: function()
	{
		log('TP.Result.build();');

		var panel = TP.Layout.getPanel(3);
		if (panel) {
			this.wrapper = panel.getInner();
			this.frame = new Element('div.frame');
			this.iframe = new Element('iframe', {name: 'sandbox'});
			this.frame.adopt(this.iframe).inject(this.wrapper);

			TP.Events.fireEvent('result.build');
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
		button: null,
		anchor: 'tl'
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

			if (this.options.anchor === 'tl') {
				this.offset = {x: pos.x, y: pos.y + size.y};
			} else if (this.options.anchor === 'br') {
				var bSize = document.body.getSize();
				pos = {x: (bSize.x - pos.x) - size.x, y: bSize.y - pos.y};
				this.offset = {x: pos.x, y: pos.y};
			}

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
				display: 'none'
			},
			events: {
				outerclick: function(e) {
					if (!self.hidden && e.target !== self.options.button) {
						self.hide();
					}
				}
			}
		});
		this.element.addClass(this.options.anchor);

		if (this.options.anchor === 'tl') {
			this.element.setStyles({top: this.offset.y, left: this.offset.x});
		} else if (this.options.anchor === 'br') {
			this.element.setStyles({bottom: this.offset.y, right: this.offset.x});
		}
		this.element.inject(TP.Layout.wrapper);
	},

	/**
	 *
	 */
	show: function()
	{
		// log('TP.Popover.show();');

		this.element.setStyles({
			display: 'block',
			// top: this.offset.y - 3,
			opacity: 0
		}).morph({
			// top: this.offset.y,
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
			// top: this.offset.y - 3,
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

