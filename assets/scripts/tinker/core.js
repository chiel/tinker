/*
---

license: MIT-style license

authors:
  - Chiel Kunkels (@chielkunkels)

...
*/

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

!function(T)
{
	'use strict';

	T.Events = new Events;
	T.init = function(config)
	{
		T.Events.fireEvent('init', config);
	};
	T.Core = {
		urls: JSON.parse(document.getElement('script[type=urls]').get('html'))
	};

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

