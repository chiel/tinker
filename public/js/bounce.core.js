/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

(function() {

/**
 * Init function which fires an event
 */
BNC.init = function(config) {
	console.log('BNC.init(', config, ');');

	BNC.Events.fireEvent('bnc.init', config);
};

/**
 *
 */
BNC.Events = new Events;

/**
 *
 */
BNC.Core = {
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
		console.log('BNC.Core.init(', config, ');');
	}
};

BNC.Core.wake();

})(typeof BNC == 'undefined' ? (window.BNC = {}) : BNC)

