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

	T.URL = {
		query: {},
		get: get
	};

	if (window.location.search !== '') {
		Array.each(window.location.search.slice(1).split('&'), function(s) {
			var param = s.split('=');
			T.URL.query[param[0]] = param[1];
		});
	}

	/**
	 *
	 */
	function get(key, value)
	{
		// log('url.get(', key, value, ');');

		return T.URL.query[key] || value;
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

