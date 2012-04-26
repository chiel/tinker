/*
route.js

author: @chielkunkels
*/'use strict';
// log('route.js');

var route = {}, params = {};

if (window.location.search !== '') {
	Array.each(window.location.search.slice(1).split('&'), function(s) {
		var param = s.split('=');
		params[param[0]] = param[1];
	});
}

//
route.param = function(key, value){
	// log('route.param(', key, value, ');');

	return params[key] || value;
};

module.exports = route;

