/*
settings/assets.js

author: @chielkunkels
*/'use strict';
// log('settings/assets.js');

var data = require('../data');
var events = require('../events');
var settings = require('./main');

var assets = [], assetList;

//
var build = function(){
	// log('settings.assets.build();');

	var html = '<ul id="asset-add">'+
		'<li><input placeholder="Enter the URL to a file"><a href="#" class="button primary">&#10010;</a></li>'+
		'</ul><ul id="asset-list"></ul>';
	var fieldset = new Element('fieldset.settings-assets', {html: html}),
		input = fieldset.getElement('input'),
		addButton = fieldset.getElement('a');
	assetList = fieldset.getElement('#asset-list');

	if (data.assets && data.assets.length) {
		Array.each(data.assets, function(url) {
			addAsset(url);
		});
	}

	input.addEvent('keyup', function(e) {
		if (e.key === 'enter') {
			var url = input.get('value').trim();

			if (addAsset(url)) {
				input.set('value', '');
			}
		}
	});

	addButton.addEvent('click', function(e) {
		e.preventDefault();
		var url = input.get('value').trim();

		if (addAsset(url)) {
			input.set('value', '');
		}
	});

	settings.addSection('Assets', fieldset);
};

//
var addAsset = function(url){
	// log('settings.assets.addAsset(', url, ');');

	if (url === '') {
		return false;
	}

	var asset = new Asset(url);
	assets.push(asset);
	assetList.adopt(asset.element);

	return true;
};

//
var removeAsset = function(asset){
	// log('settings.assets.removeAsset(', asset, ');');

	assets.splice(assets.indexOf(asset), 1);
};



/**
 *
 */
var Asset = new Class({

	//
	initialize: function(url){
		// log('Asset.initialize(', url, ');');

		this.url = url;
		this.name = this.url.replace(/^.*\/(.+)$/, '$1');
		this.type = this.name.replace(/.*\.([a-z]+)/i, '$1');
		this.element = new Element('li', {
			children: [
				new Element('span.name', {text: this.name}),
				new Element('a.delete[href=#]', {html: '&times;'}).addEvent('click', this.remove.bind(this)),
				new Element('input[type=hidden]', {name: 'assets[]', value: this.url})
			]
		});
	},

	//
	remove: function(e){
		// log('T.Asset.remove();');

		e.stop();
		this.element.destroy();
		events.publish('asset.remove', this);
	}
});

events.subscribe('settings.build', build);
events.subscribe('asset.remove', removeAsset);

