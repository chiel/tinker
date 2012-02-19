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

	/**
	 *
	 */
	T.Popover = new Class({
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
		offset: {x: 0, y: 0},
		props: {x: 'left', y: 'top'},

		/**
		 *
		 */
		initialize: function(contents, options)
		{
			// log('T.Popover.initialize(', contents, options, ');');

			this.setOptions(options);
			this.build(contents);
		},

		/**
		 *
		 */
		build: function(contents)
		{
			// log('T.Popover.build(', contents, ');');

			var self = this, arrow;

			this.element = new Element('div.popover.'+this.options.anchor, {
				children: [
					arrow = new Element('div.popover-arrow'),
					new Element('div.popover-content', {children: contents})
				],
				morph: {
					duration: 100
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

			if (this.options.button) {
				var pos = this.options.button.getPosition(),
					size = this.options.button.getSize(),
					bSize = document.body.getSize();

				if (this.options.anchor.test(/t/)) {
					this.offset.y = pos.y + size.y;
				} else if (this.options.anchor.test(/b/)) {
					this.offset.y = bSize.y - pos.y;
					this.props.y = 'bottom';
				}

				if (this.options.anchor.test(/l/)) {
					this.offset.x = pos.x;
				} else if (this.options.anchor.test(/r/)) {
					this.offset.x = bSize.x - pos.x - size.x;
					this.props.x = 'right';
				}

				arrow.setStyle(this.props.x, (size.x/2)-9);

				this.options.button.addEvent('click', function(e) {
					e.preventDefault();
					self.toggle();
				});
			}

			this.element.setStyle(this.props.x, this.offset.x);
			this.element.setStyle(this.props.y, this.offset.y);
			this.element.inject(T.Layout.wrapper);
		},

		/**
		 *
		 */
		show: function()
		{
			// log('T.Popover.show();');

			var from = {display: 'block', opacity: 0};
			from[this.props.y] = this.offset.y - 3;
			var to = {opacity: 1};
			to[this.props.y] = this.offset.y;

			this.element.setStyles(from).morph(to);
			this.hidden = false;

			if (this.options.button) {
				this.options.button.addClass('active');
			}
		},

		/**
		 *
		 */
		hide: function()
		{
			// log('T.Popover.hide();');

			var to = {opacity: 0};
			to[this.props.y] = this.offset.y - 3;

			this.element.morph(to).get('morph').chain(function() {
				this.subject.setStyle('display', 'none');
			});
			this.hidden = true;

			if (this.options.button) {
				this.options.button.removeClass('active');
			}
		},

		/**
		 *
		 */
		toggle: function()
		{
			// log('T.Popover.toggle();');

			if (this.hidden) {
				this.show();
			} else {
				this.hide();
			}
		}
	});

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

