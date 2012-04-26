/*
data.js

author: @chielkunkels
*/'use strict';
// log('data.js');

var data = JSON.parse(document.getElement('script[type=tinker]').get('html'));
var tinker = {
	hash: data.hash || null,
	revision: data.revision || null,
	revision_id: data.revision_id || 0,
	x_user_id: data.x_user_id || null,
	username: data.username || null,
	doctype: data.doctype || null,
	framework: data.framework || null,
	extensions: data.extensions || [],
	normalize: data.normalize || null,
	assets: data.assets || [],
	title: data.title || null,
	description: data.description || null,
	markup: data.markup || null,
	style: data.style || null,
	interaction: data.interaction || null
};

module.exports = tinker;

