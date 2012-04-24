/*
editor/base.js

author: @chielkunkels
*/'use strict';
log('editor/base.js');

var base = {
	// Keep track of the active line
	curLine: 0,

	// Shared options
	mirrorOptions: {
		tabSize: 4,
		indentUnit: 4,
		indentWithTabs: true,
		lineNumbers: true,
		matchBrackets: true,
		fixedGutter: true,
		theme: 'tinker-light'
	},

	// current panel
	panel: null,

	//
	prepare: function(){
		// T.Events.addEvent('layout.build', this.init.bind(this));
		// T.Events.addEvent('tinker.save', this.save.bind(this));
		// T.Events.addEvent('layout.activate', this.refresh.bind(this));
		// T.Events.addEvent('layout.dragEnd', this.refresh.bind(this));
	},

	//
	init: function(){
		// log('editor.init();');

		var self = this;
		Object.append(this.mirrorOptions, {
			onFocus: this.onFocus.bind(this),
			onBlur: this.onBlur.bind(this),
			onCursorActivity: this.highlightLine.bind(this)
		});
		this.build();
	},

	// focus event
	onFocus: function(){
		// log('editor.onFocus();');

		this.frame.addClass('focused');
		this.highlightLine();
	},

	// blur event
	onBlur: function(){
		// log('editor.onBlur();');

		this.frame.removeClass('focused');
	},

	// highlight current line
	highlightLine: function(){
		// log('editor.highlightLine();');

		if (this.codemirror) {
			this.codemirror.setLineClass(this.curLine, null);
			this.curLine = this.codemirror.getCursor().line;
			this.codemirror.setLineClass(this.curLine, 'active_line');
		}
	},

	// make sure the editor is rendered properly
	refresh: function(){
		if (this.codemirror) {
			this.codemirror.refresh();
		}
	},

	// Copy codemirror contents to it's textarea
	save: function(){
		if (this.codemirror) {
			this.textarea.set('value', this.codemirror.getValue().toBase64());
		}
	},

	//
	getPanel: function(){
		return this.panel;
	}
};

module.exports = base;

