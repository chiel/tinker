/**
 * @author Chiel Kunkels <chiel@kunkels.me>
 */
"use strict";

(function() {

/**
 *
 */
BNC.Document = {
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
		console.log('BNC.Document.init(', config, ');');
	}
};

BNC.Document.wake();

})(typeof BNC == 'undefined' ? (window.BNC = {}) : BNC)

