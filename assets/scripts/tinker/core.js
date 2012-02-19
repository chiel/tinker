/*
---

license: MIT-style license

authors:
  - Chiel Kunkels (@chielkunkels)

...
*/

/**
 * console.log wrapper
 */
window.log = function()
{
	if (window.console) {
		console.log.apply(console, Array.prototype.slice.call(arguments));
	}
};

/**
 *
 */
Element.Events.outerclick = {

	onAdd: function(fn){
		var el = this,
			listener = el.retrieve('outerclick:listener');

		if (listener) return;

		listener = function(e){
			var target = e.target;
			if (target != el && !el.contains(target)) el.fireEvent('outerclick', e);
		};
		document.id(document.body).addEvent('click', listener);
		el.store('outerclick:listener', listener);
	},

	onRemove: function(fn){
		var el = this,
			listener = el.retrieve('outerclick:listener');
		if (!listener) return;
		document.id(document.body).removeEvent('click', listener);
	}
};

/**
 *
 */
Element.Properties.children = {
	set: function(items) {
		if (!Type.isEnumerable(items)) items = Array.from(items);
		this.adopt(items);
		return this;
	}
};

!function(T)
{
	'use strict';

	T.Events = new Events;
	T.init = function(config)
	{
		T.Events.fireEvent('init', config);
	};
	T.Core = {
		urls: JSON.parse(document.getElement('script[type=urls]').get('html'))
	};

	T.Events.addEvent('layout.build', build);

	function build()
	{
		log('core.build();');

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

