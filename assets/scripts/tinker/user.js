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
		var userButton = new Element('a.account[href=#account][text=Account]');
		T.Layout.addToRegion(userButton, 'bl');
		var html = '<ul><li><label>Username</label><input name="username"></li>'
			+'<li><label>Password</label><input name="password" type="password"></li>'
			+'<li><input type="submit" class="button" value="Register">'
			+'<input type="submit" class="button primary" value="Login"></li></ul>';
		var contents = new Element('fieldset', {html: html});
		var popover = new T.Popover(contents, {button: userButton, anchor: 'bl'});
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

