/*
panes.js

author: @chielkunkels
*/'use strict';
log('panes.js');

var panes = new Class({

	Implements: Options,

	options: {tabs: true},
	wrapper: null,
	tabs: null,
	panes: null,

	//
	initialize: function(parent, options){
		log('panes.initialize(', parent, options, ');');

		this.setOptions(options);
		this.wrapper = new Element('div.panes');
		this.panes = new Element('div.panes').inject(this.wrapper);

		if (this.options.tabs) {
			var self = this;

			this.tabs = new Element('ul.tabs').inject(this.wrapper);
			this.tabs.addEvent('click:relay(a)', function(e){
				e.preventDefault();
				self.activate(e.target.get('data-index'));
			});
		}

		this.wrapper.inject(parent);
	},

	//
	addPane: function(name, el){
		log('panes.addPane(', name, el, ');');
	}

});


module.exports = panes;

