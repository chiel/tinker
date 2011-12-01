/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

(function() {

/**
 *
 */
BNC.Layout = {
	/**
	 *
	 */
	wake: function() {
		BNC.Events.addEvent('bnc.init', this.init.bind(this));
	},

	/**
	 *
	 */
	init: function(config) {
		console.log('BNC.Layout.init(', config, ');');

		this.build();
	},

	/**
	 *
	 */
	build: function() {
		console.log('BNC.Layout.build();');

		this.header = new Element('header').inject(document.body);
		this.body = new Element('form#body').inject(document.body);
		this.footer = new Element('footer').inject(document.body);
	}
};
BNC.Layout.wake();

/**
 *
 */
BNC.Layouts = [{
	/**
	 *
	 */
	activate: function() {
		console.log('BNC.Layouts[0].activate();');
	},

	/**
	 *
	 */
	deactivate: function() {
		console.log('BNC.Layouts[0].deactivate();');
	}
}];

})(typeof BNC == 'undefined' ? (window.BNC = {}) : BNC)

