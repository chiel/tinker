/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

var Bounce = (function() {

	/**
	 * This gets passed back
	 */
	var init = function(config)
	{
		// console.log('Bounce(',config,');');

		BNC.hash.init();
		BNC.document.init();
		BNC.layout.init();
	};



	/**
	 * Local namespace
	 */
	var BNC = {};



	/**
	 * Events
	 */
	BNC.events = new Events;



	/**
	 * Possible hashes:
	 * - /j8KnL: a document
	 * - /j8KnL/2: document + revision
	 */
	BNC.hash = {
		/**
		 * The hash
		 */
		hash: null,

		/**
		 *
		 */
		init: function()
		{
			// console.log('BNC.hash.init();');

			var self = this;
			self.hash = window.location.hash.replace(/^#/, '');
		}
	};



	/**
	 * All things related to the document
	 */
	BNC.document = {
		/**
		 * Indicates whether the document has been loaded yet
		 */
		_loaded: false,

		/**
		 * Fetch data for the
		 */
		init: function()
		{
			// console.log('BNC.document.init();');
		},

		/**
		 * Fetch the current document
		 */
		fetch: function()
		{
			console.log('BNC.document.fetch();');
		},

		/**
		 * Return document's markup
		 */
		getHTML: function()
		{
			console.log('BNC.document.getHTML();');
		},

		/**
		 * Return document's styling
		 */
		getCSS: function()
		{
			console.log('BNC.document.getCSS();');
		},

		/**
		 * Return document's interaction
		 */
		getJS: function()
		{
			console.log('BNC.document.getJS();');
		},

		/**
		 * Executes the document's code in the result frame
		 */
		execute: function()
		{
			console.log('BNC.document.execute();');
		},

		/**
		 * Save the document's code to the database
		 */
		save: function()
		{
			console.log('BNC.document.save();');
		}
	};



	/**
	 * Things that are shared across all layouts
	 */
	BNC.layout = {
		/**
		 * Keep track of the currently active layout
		 */
		curLayout: null,

		/**
		 *
		 */
		init: function()
		{
			// console.log('BNC.layout.init();');

			this.build();
			this.setEvents();
		},

		/**
		 * Build up common elements used by all layouts
		 */
		build: function()
		{
			// console.log('BNC.layout.build();');

			this.header = new Element('header').inject(document.body);
			this.body = new Element('form#body').inject(document.body);
			this.footer = new Element('footer').inject(document.body);

			this.panels = [
				new BNC.panel(this.body, 0),
				new BNC.panel(this.body, 1),
				new BNC.panel(this.body, 2),
				new BNC.panel(this.body, 3)
			];

			this.frames = {
				markup: new BNC.markupEditor(this.panels[0]),
				style: new BNC.styleEditor(this.panels[1]),
				interaction: new BNC.interactionEditor(this.panels[2]),
				result: new BNC.result(this.panels[3])
			};

			var elements = [];
			Array.each(this.panels, function(p) {
				elements.push(p.getPanel());
			});
			this.fx = new Fx.Elements(elements, {duration: 200});
			this.activate();
		},

		/**
		 *
		 */
		setEvents: function()
		{
			// console.log('BNC.layout.setEvents();');
		},

		/**
		 * Activate a layout by index
		 */
		activate: function(newLayout)
		{
			// console.log('BNC.layout.activate(',newLayout,');');

			if (newLayout !== this.curLayout) {
				var init = this.curLayout === null;

				if (init && !BNC.layouts[newLayout]) {
					newLayout = 0;
				}

				if (!init && BNC.Layouts[this.curLayout]) {
					document.html.removeClass('layout-'+this.curLayout);
					BNC.layouts[this.curLayout].deactivate();
				}

				if (BNC.layouts[newLayout]) {
					document.html.addClass('layout-'+newLayout);
					BNC.layouts[newLayout].activate();
					this.curLayout = newLayout;
				}
			}
		}
	};



	/**
	 * There is more than one layout
	 */
	BNC.layouts = [];



	/**
	 *
	 */
	BNC.layouts.push({
		/**
		 * Bound events
		 */
		bound: [],

		/**
		 * Drag handles used by this layout
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
			// console.log('BNC.layouts[0].activate();');

			var dimensions = this.getDimensions();
			BNC.layout.fx.set(dimensions);
			this.build();
			this.recalibrate();
		},

		/**
		 * Deactivate this layout
		 */
		deactivate: function()
		{
			console.log('BNC.layouts[0].deactivate();');
		},

		/**
		 * Calculate the dimensions of each panel based on relative sizing
		 */
		getDimensions: function()
		{
			// console.log('BNC.layouts[0].getDimensions();');

			var rs = this.relativeSizes,
				bSize = BNC.layout.body.getSize(),
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
		 * Build up additional element required for this layout
		 */
		build: function()
		{
			// console.log('BNC.layouts[0].build();');

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

			this.handles.inject(BNC.layout.body);
		},

		/**
		 * Recalibrate handle positions/sizes
		 */
		recalibrate: function()
		{
			// console.log('BNC.Layouts[0].recalibrate()');

			var p = BNC.layout.panels,
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
		dragStart: function(e, el)
		{
			// console.log('BNC.Layouts[0].dragStart(',e,el,')');

			e.stop();
			var p = BNC.layout.panels,
				handleId = el.retrieve('handleId'),
				handlePos = el.getPosition(BNC.layout.body),
				handleSize = el.getSize(),
				mouseStart = e.client;

			BNC.layout.frames.result.showOverlay();

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
					//
				}

			// 	if (handleId === 0) {
			// 		p[0].setStyle('height', y - p[0].getPosition(b).y + 4);
			// 		p[1].setStyles({
			// 			top: y + 4,
			// 			height: (box.y2 - y) - 4
			// 		});
			// 	} else if (handleId === 1) {
			// 		p[0].setStyle('width', x + 4);
			// 		p[1].setStyle('width', x + 4);
			// 		self.handles[0].setStyle('width', x - 8);
			// 		p[2].setStyles({
			// 			left: x + 4,
			// 			width: box.x2 - x - 4
			// 		});
			// 	} else if (handleId === 2) {
			// 		p[2].setStyle('width', (x - box.x1) + 4);
			// 		p[3].setStyles({
			// 			left: x + 4,
			// 			width: box.x2 - x - 4
			// 		});
			// 	}
			};

			// Drag end
			var mouseup = function(e) {
				BNC.layout.frames.result.hideOverlay();

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
	 * Creates a panel which can hold other elements
	 */
	BNC.panel = new Class({
		/**
		 * The panel's parent
		 */
		wrapper: null,

		/**
		 * The outer panel, less UI calculations needed
		 */
		panel: null,

		/**
		 * The inner element, this handles proper spacing
		 */
		inner: null,


		/**
		 * Creates the basic markup needed for a panel
		 */
		initialize: function(wrapper, index)
		{
			// console.log('BNC.panel.initialize();');

			this.wrapper = wrapper;
			this.panel = new Element('section#panel'+index).inject(this.wrapper);
			this.inner = new Element('div.inner').inject(this.panel);
		},

		/**
		 * Retrieve the panel outer element
		 */
		getPanel: function()
		{
			// console.log('BNC.panel.getPanel();');

			return this.panel;
		},

		/**
		 * Retrieve the panel inner element
		 */
		getInner: function()
		{
			// console.log('BNC.panel.getInner();');

			return this.inner;
		},

		/**
		 * Get coords (x1,y1,x2,y2) for a panel's inner
		 * element, relative to the wrapper
		 */
		getCoords: function()
		{
			// console.log('BNC.panel.getCoords();');

			var pos = this.inner.getPosition(this.wrapper),
				size = this.inner.getSize();

			return {x1: pos.x, y1: pos.y, x2: pos.x + size.x, y2: pos.y + size.y};
		}
	});



	/**
	 * Base of all editors
	 */
	BNC.editor = new Class({
		/**
		 * Panel parent
		 */
		panel: null,

		/**
		 * A frame which wrps the editor and possibly other elements
		 */
		frame: null,

		/**
		 * Textarea
		 */
		textarea: null,

		/**
		 * Creates the editor and injects it into the panel
		 */
		initialize: function()
		{
			// console.log('BNC.editor.initialize();');

			this.frame = new Element('div.frame').inject(this.panel.getInner());
			this.textarea = new Element('textarea').inject(this.frame);

			var self = this;
			this.textarea.addEvents({
				focusin: function() {
					self.frame.addClass('focus');
				},
				focusout: function() {
					self.frame.removeClass('focus');
				}
			});
		},

		/**
		 * Set's a new panel parent
		 */
		setPanel: function(panel)
		{
			console.log('BNC.editor.setPanel(',panel,');');
		}
	});



	/**
	 * Creates an editor for markup (html/haml)
	 */
	BNC.markupEditor = new Class({
		/**
		 * Use BNC.Editor as a base
		 */
		Extends: BNC.editor,

		/**
		 * Creates the editor instance and injects into panel
		 */
		initialize: function(panel)
		{
			// console.log('BNC.markupEditor.initialize(',panel,');');

			this.panel = panel;
			this.parent();
			this.frame.set('id', 'markup');
		}
	});



	/**
	 * Creates an editor for styling (css/sass/scss/less)
	 */
	BNC.styleEditor = new Class({
		/**
		 * Use BNC.Editor as a base
		 */
		Extends: BNC.editor,

		/**
		 * Creates the editor instance and injects into panel
		 */
		initialize: function(panel)
		{
			// console.log('BNC.styleEditor.initialize(',panel,');');

			this.panel = panel;
			this.parent();
			this.frame.set('id', 'style');
		}
	});



	/**
	 * Creates an editor for interaction (js/coffeescript)
	 */
	BNC.interactionEditor = new Class({
		/**
		 * Use BNC.Editor as a base
		 */
		Extends: BNC.editor,

		/**
		 * Creates the editor instance and injects into panel
		 */
		initialize: function(panel)
		{
			// console.log('BNC.interactionEditor.initialize(',panel,');');

			this.panel = panel;
			this.parent();
			this.frame.set('id', 'interaction');
		}
	});



	/**
	 * Creates a result frame, in the future this should
	 * perhaps support things like mobile viewports etc
	 */
	BNC.result = new Class({
		/**
		 * Panel parent
		 */
		panel: null,

		/**
		 * A frame which wrps the iframe and possibly other elements
		 */
		frame: null,

		/**
		 * Iframe
		 */
		iframe: null,

		/**
		 *
		 */
		overlay: null,

		/**
		 * Creates an iframe and injects it into the panel
		 */
		initialize: function(panel)
		{
			// console.log('BNC.result.initialize(',panel,');');

			this.panel = panel;
			this.frame = new Element('div.frame#result').inject(this.panel.getInner());
			this.iframe = new Element('iframe').inject(this.frame);
		},

		/**
		 *
		 */
		buildOverlay: function()
		{
			// console.log('BNC.result.buildOverlay();');

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
		 *
		 */
		showOverlay: function()
		{
			// console.log('BNC.result.showOverlay();');

			this.buildOverlay();
			this.overlay.inject(this.frame);
		},

		/**
		 *
		 */
		hideOverlay: function()
		{
			// console.log('BNC.result.hideOverlay();');

			this.overlay.dispose();
		}
	});



	/**
	 * Only expose the init method, rest should be hidden
	 */
	return init;

}());

