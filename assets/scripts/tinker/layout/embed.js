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

	var wrapper, header, body, panels;

	T.Layout = {
		addToRegion: function() {},
		getPanel: getPanel
	};

	T.Events.addEvent('init', build);

	var curPanel = null, curTab = null;

	function build()
	{
		T.Layout.wrapper = wrapper = new Element('form#wrapper', {
			method: 'post',
			action: T.Core.urls.sandbox,
			target: 'sandbox'
		}).inject(document.body);

		header = new Element('header').inject(wrapper);
		T.Layout.body = body = new Element('div#body').inject(wrapper);

		T.Layout.panels = panels = [
			new T.Panel(body, 0),
			new T.Panel(body, 1),
			new T.Panel(body, 2),
			new T.Panel(body, 3)
		];

		Array.each(panels, function(p) {
			p.getOuter().setStyles({
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				zIndex: 1
			});
		});

		var tabs = T.URL.get('tabs');
		if (tabs) {
			tabs = tabs.split(',');
		} else {
			tabs = ['result', 'interaction', 'markup', 'style'];
		}

		var tabHtml = '';
		Array.each(tabs, function(tab) {
			tabHtml += '<li><a href="#'+tab+'" class="button tab-'+tab+'">'+String.capitalize(tab)+'</a></li>';
		});
		var tabContainer = new Element('ul.buttons', {html: tabHtml});

		tabContainer.addEvent('click:relay(a)', function(e) {
			e.preventDefault();

			var tab = e.target.get('href').slice(1);
			var nextPanel = panelContaining(tab);
			panels[curPanel].getOuter().setStyle('z-index', 1);
			nextPanel.getOuter().setStyle('z-index', 2);
			tabContainer.getElement('.tab-'+curTab).removeClass('active');
			tabContainer.getElement('.tab-'+tab).addClass('active');
			curPanel = nextPanel.index;
			curTab = tab;
		}).inject(header);

		// ewh. hidden inputs to simulate the settings inputs
		var html = '<input type="hidden" name="doctype" value="'+T.Tinker.doctype+'">'
			+'<input type="hidden" name="framework" value="'+T.Tinker.framework+'">';
		if (T.Tinker.normalize) {
			html += '<input type="hidden" name="normalize">';
		}
		if (T.Tinker.extensions.length) {
			Array.each(T.Tinker.extensions, function(extension) {
				html += '<input type="hidden" name="extensions[]" value="'+extension+'">';
			});
		}
		if (T.Tinker.assets.length) {
			Array.each(T.Tinker.assets, function(asset) {
				html += '<input type="hidden" name="assets[]" value="'+asset+'">';
			});
		}
		html += '<input type="hidden" name="title" value="'+T.Tinker.title+'">'
		 +'<input type="hidden" name="description" value="'+T.Tinker.description+'">';
		new Element('div', {html: html}).setStyle('display', 'none').inject(wrapper);

		T.Events.fireEvent('layout.build');

		curTab = T.URL.get('active', 'result');
		var nextPanel = panelContaining(curTab);
		nextPanel.getOuter().setStyle('z-index', 2);
		curPanel = nextPanel.index;
		tabContainer.getElement('.tab-'+curTab).addClass('active');
	}

	/**
	 * Retrieve a panel by index
	 */
	function getPanel(index)
	{
		// log('layout.getPanel(', index, ');');

		if (panels[index]) {
			return panels[index];
		}
		return false;
	}

	/**
	 *
	 */
	function panelContaining(frame)
	{
		switch (frame) {
			case 'result': return T.Result.getPanel(); break;
			case 'interaction': return T.InteractionEditor.getPanel(); break;
			case 'markup': return T.MarkupEditor.getPanel(); break;
			case 'style': return T.StyleEditor.getPanel(); break;
		}
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

