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

	var data = JSON.parse(document.getElement('script[type=tinker]').get('html'));
	T.Tinker = {
		hash: data.hash || null,
		revision: data.revision || null,
		doctype: data.doctype || null,
		framework: data.framework || null,
		extensions: data.extensions || [],
		normalize: data.normalize || null,
		assets: data.assets || [],
		title: data.title || null,
		description: data.description || null,
		markup: data.markup || null,
		style: data.style || null,
		interaction: data.interaction || null
	};

	T.Events.addEvent('layout.build', build);
	if (T.Tinker.hash) {
		T.Events.addEvent('result.build', run);
	}

	var inputHash, inputRevision;

	function build()
	{
		// log('tinker.build();');

		var buttons = $$(
			new Element('a.button.run[href=#run][text=Run]'),
			new Element('a.button.primary.save[href=#save][text=Save]')
		).map(function(el) {
			return new Element('li').adopt(el);
		});

		var html = '<li><a href="#run" class="button run">Run</a></li>'
			+'<li><a href="#save" class="button primary save">Save</a></li>';
		T.Layout.addToRegion(new Element('ul.buttons', {
			html: html,
			events: {
				click: function(e) {
					e.preventDefault();
					var href = e.target.get('href');
					if (href === '#run') {
						run();
					} else if (href === '#save') {
						save();
					}
				}
			}
		}), 'tr');

		T.Layout.wrapper.adopt(
			inputHash = new Element('input[type=hidden]', {name: 'hash', value: T.Tinker.hash}),
			inputRevision = new Element('input[type=hidden]', {name: 'revision', value: T.Tinker.revision})
		);
	}

	/**
	 *
	 */
	function run()
	{
		// log('tinker.run();');

		T.Events.fireEvent('tinker.save');
		T.Layout.wrapper.submit();
	}

	/**
	 *
	 */
	function save()
	{
		// log('tinker.save();');

		T.Events.fireEvent('tinker.save');
		T.Layout.wrapper.submit();

		new Request.JSON({
			url: '/save',
			data: T.Layout.wrapper,
			method: 'post',
			onSuccess: function(response) {
				if (response.status === 'ok') {
					T.Tinker.hash = response.hash;
					T.Tinker.revision = response.revision;

					inputHash.set('value', T.Tinker.hash);
					inputRevision.set('value', T.Tinker.revision);

					var url = '/'+T.Tinker.hash;
					url += T.Tinker.revision > 0 ? '/'+T.Tinker.revision : '';

					if (!!(window.history && history.pushState)) {
						history.pushState(null, null, url);
					} else {
						window.location = url;
					}
				} else if (response.status === 'error') {
					log(response.error.message);
				}
			}
		}).send();
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

