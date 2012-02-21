/*
---

license: MIT-style license

authors:
  - Chiel Kunkels (@chielkunkels)

...
*/
!function(T)
{
	'use strict';

	/**
	 * Shared functionality across editors
	 */
	T.Editor = {
		/**
		 * Keep track of the active line
		 */
		curLine: 0,
		/**
		 * Options that are shared by all codemirror instances
		 */
		mirrorOptions: {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,
			lineNumbers: true,
			matchBrackets: true,
			fixedGutter: true,
			theme: 'tinker-light'
		},

		panel: null,

		/**
		 *
		 */
		prepare: function()
		{
			T.Events.addEvent('layout.build', this.init.bind(this));
			T.Events.addEvent('tinker.save', this.save.bind(this));
			T.Events.addEvent('layout.activate', this.refresh.bind(this));
			T.Events.addEvent('layout.dragEnd', this.refresh.bind(this));
		},

		/**
		 *
		 */
		init: function()
		{
			// log('editor.init();');

			var self = this;
			Object.append(this.mirrorOptions, {
				onFocus: this.onFocus.bind(this),
				onBlur: this.onBlur.bind(this),
				onCursorActivity: this.highlightLine.bind(this)
			});
			this.build();
		},

		/**
		 * When the editor gets focused
		 */
		onFocus: function()
		{
			// log('editor.onFocus();');

			this.frame.addClass('focused');
			this.highlightLine();
		},

		/**
		 * When the editor gets blurred
		 */
		onBlur: function()
		{
			// log('editor.onBlur();');

			this.frame.removeClass('focused');
		},

		/**
		 *
		 */
		highlightLine: function()
		{
			// log('editor.highlightLine();');

			if (this.codemirror) {
				this.codemirror.setLineClass(this.curLine, null);
				this.curLine = this.codemirror.getCursor().line;
				this.codemirror.setLineClass(this.curLine, 'active_line');
			}
		},

		/**
		 *
		 */
		refresh: function()
		{
			if (this.codemirror) {
				this.codemirror.refresh();
			}
		},

		/**
		 *
		 */
		build: function()
		{
			// log('editor.build();');
		},

		/**
		 * Copy codemirror contents to it's textarea
		 */
		save: function()
		{
			if (this.codemirror) {
				this.textarea.set('value', this.codemirror.getValue().toBase64());
			}
		},

		/**
		 *
		 */
		getPanel: function()
		{
			return this.panel;
		}
	};



	/**
	 *
	 */
	T.MarkupEditor = Object.merge({}, T.Editor, {
		/**
		 *
		 */
		build: function()
		{
			// log('MarkupEditor.build();');

			this.panel = T.Layout.getPanel(0);
			if (this.panel) {
				this.frame = new Element('div.frame');
				this.textarea = new Element('textarea', {
					name: 'markup',
					html: T.Tinker.markup
				});
				this.settings = new Element('div.settings', {text: 'HTML'});
				this.frame.adopt(this.textarea, this.settings).inject(this.panel.getInner());
				var options = Object.append({mode: 'text/html', value: this.textarea.get('value')}, this.mirrorOptions);
				this.codemirror = CodeMirror(this.frame, options);
				this.textarea.addClass('is-hidden');
				this.highlightLine();
			}
		}
	});
	T.MarkupEditor.prepare();



	/**
	 *
	 */
	T.StyleEditor = Object.merge({}, T.Editor, {
		/**
		 *
		 */
		build: function()
		{
			// log('T.MarkupEditor.build();');

			this.panel = T.Layout.getPanel(1);
			if (this.panel) {
				this.frame = new Element('div.frame');
				this.textarea = new Element('textarea', {
					name: 'style',
					html: T.Tinker.style
				});
				this.settings = new Element('div.settings', {text: 'CSS'});
				this.frame.adopt(this.textarea, this.settings).inject(this.panel.getInner());
				var options = Object.append({mode: 'text/css', value: this.textarea.get('value')}, this.mirrorOptions);
				this.codemirror = CodeMirror(this.frame, options);
				this.textarea.addClass('is-hidden');
				this.highlightLine();
			}
		}
	});
	T.StyleEditor.prepare();



	/**
	 *
	 */
	T.InteractionEditor = Object.merge({}, T.Editor, {
		/**
		 *
		 */
		build: function()
		{
			// log('T.MarkupEditor.build();');

			this.panel = T.Layout.getPanel(2);
			if (this.panel) {
				this.frame = new Element('div.frame');
				this.textarea = new Element('textarea', {
					name: 'interaction',
					html: T.Tinker.interaction
				});
				this.settings = new Element('div.settings', {text: 'JS'});
				this.frame.adopt(this.textarea, this.settings).inject(this.panel.getInner());
				var options = Object.append({mode: 'text/javascript', value: this.textarea.get('value')}, this.mirrorOptions);
				this.codemirror = CodeMirror(this.frame, options);
				this.textarea.addClass('is-hidden');
				this.highlightLine();
			}
		}
	});
	T.InteractionEditor.prepare();



	/**
	 *
	 */
	T.Result = {
		/**
		 *
		 */
		prepare: function()
		{
			T.Events.addEvent('layout.build', this.init.bind(this));
		},

		/**
		 *
		 */
		init: function()
		{
			// log('T.Result.init()');

			T.Events.addEvent('layout.dragStart', this.showOverlay.bind(this));
			T.Events.addEvent('layout.dragEnd', this.hideOverlay.bind(this));

			this.build();
		},

		/**
		 *
		 */
		build: function()
		{
			// log('T.Result.build();');

			this.panel = T.Layout.getPanel(3);
			if (this.panel) {
				this.wrapper = this.panel.getInner();
				this.frame = new Element('div.frame');
				this.iframe = new Element('iframe', {name: 'sandbox'});
				this.frame.adopt(this.iframe).inject(this.wrapper);

				T.Events.fireEvent('result.build');
			}
		},

		/**
		 * Create an overlay over the iframe
		 */
		buildOverlay: function()
		{
			// log('T.Result.buildOverlay();');

			if (!this.overlay) {
				this.overlay = new Element('div', {
					styles: {
						position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
						zIndex: 2, opacity: 1, background: 'transparent'
					}
				});
			}
		},

		/**
		 * Show the drag overlay to prevent mouse interference
		 */
		showOverlay: function()
		{
			// log('T.Result.showOverlay();');

			this.buildOverlay();
			this.overlay.inject(this.wrapper);
		},

		/**
		 * Hide the drag overlay
		 */
		hideOverlay: function()
		{
			// log('T.Result.hideOverlay();');

			this.overlay.dispose();
		},

		/**
		 *
		 */
		getPanel: function()
		{
			return this.panel;
		}
	};
	T.Result.prepare();

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

