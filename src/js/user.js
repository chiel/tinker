/*
user.js

author: @chielkunkels
*/'use strict';
// log('user.js');

var user = require('./modules/user/model.js'),
	events = require('./events'),
	layout = require('./layout/client'),
	Slides = require('./slides'),
	Modal = require('./modal'),
	notifications = require('./notifications/ui.js');

var loginSlides, loginModal;

var loginHTML = [
	'<form method="post" action="/login" class="frm frm-login l-icon">',
		'<span class="icn24 icn-logo"></span>',
		'<h2>Log in to Tinker</h2>',
		'<fieldset>',
			'<ul>',
				'<li>',
					'<span class="fld has-error">',
						'<input type="email" placeholder="johndoe@example.com" name="email" id="login-email" autofocus>',
						'<label for="login-email" class="icn16 icn-email">E-mail</label>',
					'</span>',
				'</li>',
				'<li>',
					'<span class="fld">',
						'<input type="password" placeholder="Password" name="password" id="login-password">',
						'<label for="login-password" class="icn16 icn-password">Password</label>',
					'</span>',
				'</li>',
				'<li class="frm-actions">',
					'<input type="submit" class="btn btn-large btn-default" value="Log in">',
					'<a href="#signup" class="sld-next">Create a new account &rarr;</a>',
				'</li>',
			'</ul>',
		'</fieldset>',
	'</form>'
].join('');

var signupHTML = [
	'<form method="post" action="/signup" class="frm frm-signup l-icon">',
		'<span class="icn24 icn-logo"></span>',
		'<h2>Sign up for Tinker</h2>',
		'<fieldset>',
			'<ul>',
				'<li>',
					'<span class="fld has-error">',
						'<input type="email" placeholder="johndoe@example.com" id="signup-email">',
						'<label for="signup-email" class="icn16 icn-email">E-mail</label>',
					'</span>',
				'</li>',
				'<li>',
					'<span class="fld">',
						'<input type="password" placeholder="Password" id="signup-password">',
						'<label for="signup-password" class="icn16 icn-password">Password</label>',
					'</span>',
				'</li>',
				'<li class="frm-actions">',
					'<a href="#login" class="sld-prev">&larr; Log in</a>',
					'<input type="submit" class="btn btn-large btn-default" value="Sign up">',
				'</li>',
			'</ul>',
		'</fieldset>',
	'</form>'
].join('');

var forgotPassword = [
	'<p>Forgot password</p>'
].join('');

var slidesHtml = [
	'<section class="slide">', loginHTML, '</section>',
	'<section class="slide">', signupHTML, '</section>',
	'<section class="slide">', forgotPassword, '</section>'
].join('');

var slidesEl = new Element('div.slides', {html: slidesHtml});

var loginForm, signupForm, loginButton, signupButton;

function build(){
	// log('user.build()');

	// logged in user
	if (user.isLoggedIn()) {
		var logoutButton = new Element('a.icn.icn-login[href=#logout][text=Log out]');
		layout.addToRegion(logoutButton, 'bl');
		logoutButton.addEvent('click', function(e){
			e.preventDefault();
			events.subscribe('user.logout', function() {
				log('user logged out');
			});
			user.logout();
		});

	// logged out user
	} else {
		var loginButton = new Element('a.icn.icn-login[href=#login][text=Log in]');
		layout.addToRegion(loginButton, 'bl');
		loginModal = new Modal('signup', slidesEl);
		loginSlides = new Slides(slidesEl);
		loginForm = slidesEl.getElement('.frm-login');
		signupForm = slidesEl.getElement('.frm-signup');

		loginForm.addEvent('submit', function(e){
			e.preventDefault();

			login();
		});

		signupForm.addEvent('submit', function(e){
			e.preventDefault();

			signup();
		});

		loginButton.addEvent('click', function(e){
			e.preventDefault();
			loginModal.show();
		});
	}
}

function login(){
	// log('user.login();');

	if (!loginButton) {
		loginButton = loginForm.getElement('input[type=submit]');
	}

	var email = $('login-email').get('value');
	var password = $('login-password').get('value');

	if (!email || !password) {
		log('TODO: error handling for empty fields');
		return;
	}

	events.subscribe('user.login', function(success){
		if (success) {
			log('user successfully logged in');
			loginModal.hide();
			notification.send('info', 'You are now logged in!');
		} else {
			log('TODO: handle failed login');
		}
	});
	user.login(email, password);

	// loginButton.set('disabled', true);
}

function signup(){
	log('user.signup();');

	if (!signupButton) {
		signupButton = signupForm.getElement('input[type=submit]');
	}

	var email = $('signup-email').get('value');
	var password = $('signup-password').get('value');

	if (!email || !password) {
		log('TODO: error handling for empty fields');
		return;
	}

	new Request.JSON({
		url: '/signup',
		data: {
			email: email,
			password: password
		}
	}).send();

	// signupButton.set('disabled', true);
}

events.subscribe('layout.build', build);

