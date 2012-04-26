/*
result/default.js

author: @chielkunkels
*/'use strict';
// log('result/default.js');

var events = require('../events');
var layout;

if (window.Tinker.mode === 'embed') {
	layout = require('../layout/embed');
} else {
	layout = require('../layout/client');
}

var result = {

	//
	init: function(){
		// log('T.Result.init()');

		// events.subscribe('layout.dragStart', this.showOverlay.bind(this));
		// events.subscribe('layout.dragEnd', this.hideOverlay.bind(this));

		this.build();
	},

	//
	build: function(){
		// log('result.default.build();');

		this.panel = layout.getPanel(3);
		if (!this.panel) {
			return;
		}
		this.wrapper = this.panel.getInner();
		this.frame = new Element('div.frame');
		this.iframe = new Element('iframe', {name: 'sandbox'});
		this.frame.adopt(this.iframe).inject(this.wrapper);

		events.publish('result.build');
	},

	//
	buildOverlay: function(){
		// log('result.default.buildOverlay();');

		if (!this.overlay) {
			this.overlay = new Element('div', {
				styles: {
					position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
					zIndex: 2, opacity: 1, background: 'transparent'
				}
			});
		}
	},

	// show the drag overlay to prevent the iframe fucking with the mouse
	showOverlay: function(){
		// log('result.default.showOverlay();');

		this.buildOverlay();
		this.overlay.inject(this.wrapper);
	},

	// hide the drag overlay
	hideOverlay: function(){
		// log('result.default.hideOverlay();');

		this.overlay.dispose();
	},

	//
	getPanel: function(){
		return this.panel;
	}
};

events.subscribe('layout.build', result.init.bind(result));
events.subscribe('layout.dragStart', result.showOverlay.bind(result));
events.subscribe('layout.dragEnd', result.hideOverlay.bind(result));

