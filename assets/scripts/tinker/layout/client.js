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

	// Private stuff
	T.Events.addEvent('init', build);

	var wrapper, header, body, footer, regions = {}, panels = [],
		layoutPicker, layoutButtons = new Elements(), layoutArrow, fx, curLayout;

	// Public stuff
	T.Layout = {
		min: {
			x: 200, y: 100,
			ox: 210, oy: 110
		},
		activate: activate,
		addToRegion: addToRegion,
		getPanel: getPanel
	};

	/**
	 * Build up global elements used by all layouts
	 */
	function build(config)
	{
		// log('layout.build(', config, ');');

		T.Layout.wrapper = wrapper = new Element('form#wrapper', {
			method: 'post',
			action: T.Core.urls.sandbox,
			target: 'sandbox'
		}).inject(document.body);

		header = new Element('header').inject(wrapper);
		T.Layout.body = body = new Element('div#body').inject(wrapper);
		footer = new Element('footer').inject(wrapper);

		regions = {
			tl: new Element('div.region.tl').inject(header),
			tm: new Element('div.region.tm').inject(header),
			tr: new Element('div.region.tr').inject(header),
			bl: new Element('div.region.bl').inject(footer),
			bm: new Element('div.region.bm').inject(footer),
			br: new Element('div.region.br').inject(footer)
		};

		T.Layout.panels = panels = [
			new T.Panel(body, 0),
			new T.Panel(body, 1),
			new T.Panel(body, 2),
			new T.Panel(body, 3)
		];

		var els = panels.map(function(p) { return p.getOuter(); });
		T.Layout.fx = new Fx.Elements(els, {duration: 200});
		buildLayoutPicker();
		activate(localStorage['activeLayout'] || 0);
		T.Events.fireEvent('layout.build');
	}

	/**
	 * Build up the layout picker based on available layouts
	 */
	function buildLayoutPicker()
	{
		// log('layout.buildLayoutPicker();');

		Array.each(T.Layouts, function(layout, index) {
			var anchor = new Element('a.button-layout.ls-'+index, {
				href: '#layout'+index
			}).store('layoutIndex', index);
			layoutButtons.push(anchor);
		});

		layoutPicker = new Element('div#layoutpicker', {
			children: [
				layoutArrow = new Element('div.arrow', {
					morph: {duration: 150}
				}),
				new Element('ul', {
					children: layoutButtons.map(function(el) { return new Element('li').adopt(el); })
				})
			]
		}).addEvent('click', function(e) {
			e.preventDefault();
			if (e.target.get('tag') === 'a') {
				activate(e.target.retrieve('layoutIndex'));
			}
		});
		addToRegion(layoutPicker, 'bm');
	}

	/**
	 * Activate a layout by index
	 */
	function activate(index)
	{
		// log('layout.activate(', index, ');');

		if (index !== curLayout) {
			var init = curLayout === undefined;

			if (init && !T.Layouts[index]) {
				index = 0;
			}

			if (!init && T.Layouts[curLayout]) {
				layoutButtons[curLayout].removeClass('active');
				document.html.removeClass('layout-'+curLayout);
				T.Layouts[curLayout].deactivate();
			}

			if (T.Layouts[index]) {
				var pos = layoutButtons[index].getPosition(layoutPicker),
					size = layoutButtons[index].getSize();
				layoutArrow.morph({left: (pos.x + (size.x/2) - 5)});
				layoutButtons[index].addClass('active');
				document.html.addClass('layout-'+index);
				localStorage['activeLayout'] = index;
				T.Layouts[index].activate(init);
				curLayout = index;
			}
		}
	}

	/**
	 * Add an element to an available region
	 */
	function addToRegion(node, region)
	{
		// log('layout.addToRegion(', node, region, ');');

		if (!regions[region]) {
			return;
		}
		if (typeOf(node) !== 'element') {
			return;
		}

		regions[region].adopt(node);
	}

	/**
	 * Retrieve a panel by index
	 */
	function getPanel(index)
	{
		// log('layout.getPanel(', index, ');');

		if (panels[index]) {
			return panels[index];
		}
		return false;
	}

	/**
	 * Array of available layouts
	 */
	T.Layouts = [];

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

