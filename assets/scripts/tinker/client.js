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

	T.Events.addEvent('layout.build', build);

	function build()
	{
		// log('core.build();');

		T.Layout.addToRegion(new Element('h1.logo', {html: '<a href="'+T.Core.urls.client+'"></a>'}), 'tm');
		var aboutButton = new Element('a.about[href=#about][text=About]');
		T.Layout.addToRegion(aboutButton, 'br');

		var html = '<p><strong>Tinker</strong> is a quick and easy tool for writing and sharing code for the web</p>'
			+'Tinker comes from <a href="https://twitter.com/#!/chielkunkels">@chielkunkels</a> and '
			+'<a href="https://twitter.com/#!/ponjoh">@ponjoh</a>. The logo was designed by '
			+'<a href="https://twitter.com/#!/dotmariusz">@dotmariusz</a>.</p><p>Tinker is open source, so '
			+'<a href="http://git.io/tinker">Check it out on Github</a>.</p>'
			+'<ul class="twitter-buttons">'
			+'<li class="tweet"><a href="https://twitter.com/share" class="twitter-share-button" data-url="https://tinker.io">Tweet</a></li>'
			+'<li class="follow"><a href="https://twitter.com/tinker_io" class="twitter-follow-button" data-show-count="false">Follow @tinker_io</a></li>'
			+'</div>';

		!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

		var contents = new Element('p', {text: 'sup'});
		var popover = new T.Popover(new Element('div', {html: html}), {button: aboutButton, anchor: 'br'});
		popover.element.addClass('po-about');
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);


