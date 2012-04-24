/*
editor/style.js

author: @chielkunkels
*/'use strict';
log('editor/style.js');

var events = require('../events');
var base = require('./base');
var layout = require('../layout/client');
var tinker;

var editor = Object.merge({}, base, {

	//
	build: function(){
		this.panel = layout.getPanel(1);
		if (!this.panel) {
			return false;
		}
		tinker = require('../tinker');
		this.frame = new Element('div.frame');
		this.textarea = new Element('textarea', {
			name: 'style',
			html: tinker.style
		});
		this.settings = new Element('div.settings', {text: 'CSS'});
		this.frame.adopt(this.textarea, this.settings).inject(this.panel.getInner());
		var options = Object.append({mode: 'text/css', value: this.textarea.get('value')}, this.mirrorOptions);
		this.codemirror = CodeMirror(this.frame, options);
		this.textarea.addClass('is-hidden');
		this.highlightLine();
	}

});

events.subscribe('layout.build', editor.init.bind(editor));
events.subscribe('tinker.save', editor.save.bind(editor));
events.subscribe('layout.activate', editor.refresh.bind(editor));
events.subscribe('layout.dragEnd', editor.refresh.bind(editor));

