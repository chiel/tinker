/*
layout/layouts/1.js

author: @chielkunkels
*/'use strict';
log('layout/layouts/1.js');

var storage = {},
	cache = {};

//
storage.set = function(key, value){
	log('storage.set(', key, value, ');');

	cache[key] = value;
};

//
storage.get = function(key, defaultValue){
	log('storage.get(', key, defaultValue, ');');

	return cache[key] || defaultValue;
};

storage.persist = function(){
	if (window.localStorage) {
		window.localStorage.tinker = JSON.stringify(cache);
	}
};

// read cache if it exists
if (window.localStorage && window.localStorage.tinker) {
	cache = JSON.parse(window.localStorage.tinker);
}

window.addEvent('unload', storage.persist);

module.exports = storage;

