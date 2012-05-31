/*
modal.js

author: @chielkunkels
*/'use strict';
// log('modal.js');

var modalBg = new Element('div.modal-bg.is-hidden').inject(document.body);

var modal = new Class({

	initialize: function(name, body){
		// log('modal.initialize()');

		this.wrapper = new Element('div.modal.is-hidden'+(name ? '.modal-'+name : '')).inject(document.body);
		if (body) {
			this.wrapper.adopt(body);
		}
	},

	show: function(){
		// log('modal.show()');

		modalBg.removeClass('is-hidden');
		this.wrapper.removeClass('is-hidden');
	},

	hide: function(){
		// log('modal.hide();');

		modalBg.addClass('is-hidden');
		this.wrapper.addClass('is-hidden');
	}

});

module.exports = modal;

