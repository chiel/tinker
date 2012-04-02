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

	function build(){
		T.Layout.wrapper.adopt(
			new Element('input[type=hidden]', {name: 'x_user_id', value: '0'})
		);
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

