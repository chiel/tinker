/*
layout/panel.js

author: @chielkunkels
*/'use strict';
// log('layoout/panel.js');

var panel = new Class({

	// parent
	wrapper: null,

	// outer element
	outer: null,

	// inner element
	inner: null,

	/**
	 * Create basic markup required for a panel
	 */
	initialize: function(wrapper, index)
	{
		// log('TP.Panel.initialize(', wrapper, index, ');');

		this.wrapper = wrapper;
		this.index = index;
		this.outer = new Element('section.panel#panel'+index).inject(this.wrapper);
		this.inner = new Element('div.inner').inject(this.outer);
	},

	/**
	 * Retrieve the panel's outer element
	 */
	getOuter: function()
	{
		// log('TP.Panel.getOuter();', this.outer);

		return this.outer;
	},

	/**
	 * Retrieve the panel's inner element
	 */
	getInner: function()
	{
		// log('TP.Panel.getInner();');

		return this.inner;
	},

	/**
	 * Get coords for a panel's inner element, relative to the wrapper
	 */
	getCoords: function(outer)
	{
		// log('TP.Panel.getCoords();');

		var pos = this.inner.getPosition(this.wrapper),
			size = this.inner.getSize();

		return {
			x1: pos.x,
			y1: pos.y,
			x2: pos.x + size.x,
			y2: pos.y + size.y
		};
	}

});

module.exports = panel;

