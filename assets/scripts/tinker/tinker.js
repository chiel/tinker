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
		revision_id: data.revision_id || 0,
		x_user_id: data.x_user_id || null,
		username: data.username || null,
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

	// rewrite the url if needed
	if (T.Tinker.username) {
		var url = '/'+T.Tinker.username+'/'+T.Tinker.hash;
		if (T.Tinker.revision) {
			url += '/'+T.Tinker.revision;
		}
		if (!!(window.history && history.pushState)) {
			history.pushState(null, null, url);
		} else {
			window.location = url;
		}
	}

	T.Events.addEvent('layout.build', build);
	if (T.Tinker.hash) {
		T.Events.addEvent('result.build', run);
	}

	var inputHash, inputRevision, inputRevisionId, saveButton;

	function build()
	{
		// log('tinker.build();');

		var saveLabel = T.Tinker.username ? 'Fork' : 'Save',
			buttons;

		var html = '<li><a href="#run" class="button run">Run</a></li>'
			+'<li><a href="#save" class="button primary save">'+saveLabel+'</a></li>';
		T.Layout.addToRegion(buttons = new Element('ul.buttons', {
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

		saveButton = buttons.getElement('.save');

		T.Layout.wrapper.adopt(
			inputHash = new Element('input[type=hidden]', {name: 'hash', value: T.Tinker.hash}),
			inputRevision = new Element('input[type=hidden]', {name: 'revision', value: T.Tinker.revision}),
			inputRevisionId = new Element('input[type=hidden]', {name: 'revision_id', value: T.Tinker.revision_id})
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
					T.Tinker.revision_id = response.revision_id;

					inputHash.set('value', T.Tinker.hash);
					inputRevision.set('value', T.Tinker.revision);
					inputRevisionId.set('value', T.Tinker.revision_id);
					saveButton.set('text', 'Save');

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

