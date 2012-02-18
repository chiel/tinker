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

	// Public stuff
	var data = JSON.parse(document.getElement('script[type=tinker]').get('html'));
	T.Tinker = {
		hash: data.hash || null,
		revision: data.revision || null,
		doctype: data.revision || null,
		framework: data.framework || null,
		normalize: data.normalize || null,
		assets: data.assets || [],
		title: data.title || null,
		description: data.description || null,
		markup: data.markup || null,
		style: data.style || null,
		interaction: data.interaction || null
	};

	// Private stuff
	T.Events.addEvent('layout.build', build);

	function build()
	{
		// log('tinker.build();');
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

