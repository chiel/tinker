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
			this.element.inject(T.Layout.wrapper);
		},

		/**
		 *
		 */
		show: function()
		{
			// log('T.Popover.show();');

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
			// log('T.Popover.hide();');
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
			// log('T.Popover.toggle();');

			if (this.hidden) {
				this.show();
			} else {
				this.hide();
			}
		}
	});

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

