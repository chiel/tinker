/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

(function() {

BNC.Editor = {
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
		console.log('BNC.Editor.init();');

		this.build();
	},

	/**
	 *
	 */
	build: function()
	{
		console.log('BNC.Editor.build();');
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
		console.log('BNC.MarkupEditor.build();');

		var panel = BNC.Layout.getPanel(0);
		if (panel) {
			new Element('div.frame').adopt(new Element('textarea')).inject(panel.getInner());
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
		console.log('BNC.MarkupEditor.build();');

		var panel = BNC.Layout.getPanel(1);
		if (panel) {
			new Element('div.frame').adopt(new Element('textarea')).inject(panel.getInner());
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
		console.log('BNC.MarkupEditor.build();');

		var panel = BNC.Layout.getPanel(2);
		if (panel) {
			new Element('div.frame').adopt(new Element('textarea')).inject(panel.getInner());
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
		console.log('BNC.Result.init()');

		BNC.Events.addEvent('bnc.layout.dragStart', this.showOverlay.bind(this));
		BNC.Events.addEvent('bnc.layout.dragEnd', this.hideOverlay.bind(this));

		this.build();
	},

	/**
	 *
	 */
	build: function()
	{
		console.log('BNC.Result.build();');

		var panel = BNC.Layout.getPanel(3);
		if (panel) {
			this.wrapper = panel.getInner();
			new Element('div.frame').adopt(new Element('iframe')).inject(this.wrapper);
		}
	},

	/**
	 *
	 */
	buildOverlay: function()
	{
		// console.log('BNC.Result.buildOverlay();');

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
		// console.log('BNC.Result.showOverlay();');

		this.buildOverlay();
		this.overlay.inject(this.wrapper);
	},

	/**
	 *
	 */
	hideOverlay: function()
	{
		// console.log('BNC.Result.hideOverlay();');

		this.overlay.dispose();
	}
};
BNC.Result.wake();

})(typeof BNC == 'undefined' ? (window.BNC = {}) : BNC)

