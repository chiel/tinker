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
	T.Storage = {
		set: set,
		get: get
	};

	// Private stuff
	window.addEvent('unload', persist);

	var cache = {};

	if (window.localStorage && window.localStorage['tinker']) {
		cache = JSON.parse(window.localStorage['tinker']);
	}

	/**
	 * Set a value in localstorage
	 */
	function set(key, value)
	{
		// log('storage.set(', key, value, ');');

		cache[key] = value;
	}

	/**
	 * Get a value from localstorage by cache
	 */
	function get(key, value)
	{
		// log('storage.get(', key, ');');

		return cache[key] || value;
	}

	/**
	 * Store the cache in localstorage
	 */
	function persist()
	{
		// log('storage.persist();');

		if (window.localStorage) {
			window.localStorage['tinker'] = JSON.stringify(cache);
		}
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

