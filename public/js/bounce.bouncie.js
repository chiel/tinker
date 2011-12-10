/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

(function() {

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
		// console.log('BNC.Bouncie.init(', config, ');');

		this.markup = document.getElement('script[type=bouncie/markup]').get('html');
		this.style = document.getElement('script[type=bouncie/style]').get('html');
		this.interaction = document.getElement('script[type=bouncie/interaction]').get('html');

		BNC.Events.addEvent('bnc.layout.build', this.build.bind(this));
	},

	build: function()
	{
		console.log('BNC.Bouncie.build();');

		var buttons = '<li><a href="#execute" class="button">Execute</a></li>'
			+'<li><a href="#save" class="button primary">Save</a></li>';
		new Element('ul', {
			html: buttons,
			events: {
				click: function(e) {
					e.stop();
					console.log('clicked');
				}
			}
		}).inject(BNC.Layout.footer);
	},

	/**
	 * Get markup for current bouncie
	 */
	getMarkup: function()
	{
		// console.log('BNC.Bouncie.getMarkup();');

		return this.markup;
	},

	/**
	 * Get style for current bouncie
	 */
	getStyle: function()
	{
		// console.log('BNC.Bouncie.getStyle();');

		return this.style;
	},

	/**
	 * Get interaction for current bouncie
	 */
	getInteraction: function()
	{
		// console.log('BNC.Bouncie.getInteraction();');

		return this.interaction;
	},

	/**
	 * Execute the current bouncie in the result frame
	 */
	execute: function()
	{
		console.log('BNC.Bouncie.execute();');
	},

	/**
	 * Save the current bouncie
	 */
	save: function()
	{
		console.log('BNC.Bouncie.save();');
	}
};
BNC.Bouncie.wake();

})(typeof BNC == 'undefined' ? (window.BNC = {}) : BNC);

