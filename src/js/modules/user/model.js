/*
file:   modules/user/model.js
author: @chielkunkels

Provides data about the current user

*/'use strict';
// log('modules/user/model.js');

var events = require('../../events');

var userEl = document.getElement('script[type=user]');

// exposed api
var user = {};

// check if data is available
if (userEl) {
	var data = JSON.parse(userEl.get('html')) || {};
	user.id = data.id || 0;
}

// log a user in
user.login = function(email, password){
	// log('modules/user/model.login();');

	if (!email || !password) {
		return false;
	}

	new Request.JSON({
		url: '/login',
		data: {
			email: email,
			password: password
		},
		onComplete: function(response){
			log(response);
			events.publish('user.login', (response.status === 'ok'));
		}
	}).send();
};

// log a user out
user.logout = function(){
	// log('modules/user/model.logout();');

	new Request.JSON({
		url: '/logout',
		method: 'get',
		onComplete: function(){
			events.publish('user.logout');
		}
	}).send();
};

// check if a user is logged in
user.isLoggedIn = function(){
	// log('modules/user/model.isLoggedIn();');

	return !!user.id;
};

module.exports = user;

