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

	// Public interface
	T.Settings = {
		addSection: addSection
	};

	var wrapper, tabWrapper, sectionWrapper, tabs = [], sections = [], activeTab = null;

	T.Events.addEvent('layout.build', build);

	/**
	 *
	 */
	function build()
	{
		// log('settings.build();');

		wrapper = new Element('div', {html: '<ul class="tabs"></ul><div class="sections"></div>'});
		tabWrapper = wrapper.getElement('.tabs');
		sectionWrapper = wrapper.getElement('.sections');

		tabWrapper.addEvent('click:relay(a)', function(e) {
			e.preventDefault();

			activate(e.target.retrieve('index'));
		});

		T.Events.fireEvent('settings.build');

		var ul = new Element('ul.buttons', {html: '<li><a href="#settings" class="settings button">Settings</a></li>'});
		T.Layout.addToRegion(ul, 'tl');
		var popover = new T.Popover(wrapper, {button: ul.getElement('.settings')});
		popover.element.addClass('po-settings');
	}

	/**
	 *
	 */
	function addSection(name, content)
	{
		// log('settings.addSection(', name, content, ');');

		var tab = new Element('a', {href: '#', text: name}).store('index', tabs.length);
		var section = new Element('div.section').adopt(content);
		tabs.push(tab);
		sections.push(section);
		tabWrapper.adopt(new Element('li').adopt(tab));
		sectionWrapper.adopt(section);

		if (tabs.length === 1) {
			activate(0);
		}
	}

	/**
	 * Activate a tab by index
	 */
	function activate(index)
	{
		// log('settings.activate(', index, ');');

		if (activeTab !== null) {
			tabs[activeTab].removeClass('is-active');
			sections[activeTab].removeClass('is-active');
		}

		tabs[index].addClass('is-active');
		sections[index].addClass('is-active');
		activeTab = index;
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

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

	var doctypes = [], frameworks = [], versions = {}, extList;

	doctypes = JSON.parse(document.getElement('script[type=doctypes]').get('html'));
	frameworks = JSON.parse(document.getElement('script[type=frameworks]').get('html'));
	Array.each(frameworks, function(framework) {
		Array.each(framework.versions, function(version) {
			version.x_framework_id = framework.id;
			versions[version['id']] = version;
		});
	});

	T.Events.addEvent('settings.build', build);

	/**
	 *
	 */
	function build()
	{
		// log('settings.general.build();');

		var html = '<ul>'
			+'<li><label for="input-doctype">Doctype</label><select id="input-doctype" name="doctype"></select></li>'
			+'<li><label for="input-js-framework">Framework</label><select id="input-js-framework" name="framework"><option value="0">None</value></select><ul id="extension-list"></ul></li>'
			+'<li><label for="input-css-framework">Normalize.css</label><input type="checkbox" id="input-css-framework" name="normalize" checked></li>'
			+'</ul>';
		var fieldset = new Element('fieldset.settings-general', {html: html}),
			inputDoctype = fieldset.getElement('#input-doctype'),
			inputJS = fieldset.getElement('#input-js-framework'),
			inputCSS = fieldset.getElement('#input-css-framework');
		extList = fieldset.getElement('#extension-list');

		inputJS.addEvent('change', function(e) {
			showExtensions(inputJS.getSelected()[0].get('value'));
		});

		if (T.Tinker.framework) {
			showExtensions(T.Tinker.framework, true);
		}

		Array.each(doctypes, function(doctype) {
			inputDoctype.adopt(new Element('option', {text: doctype.name, value: doctype.id}));
		});

		Array.each(frameworks, function(framework) {
			var optgroup = new Element('optgroup', {label: framework.name, value: framework.id}).inject(inputJS);
			Array.each(framework.versions, function(version) {
				var option = new Element('option', {text: framework.name+' '+version.name, value: version.id}).inject(optgroup);
				if (T.Tinker.framework === version.id) {
					option.set('selected', true);
				}
			});
		});

		T.Events.fireEvent('settings.general.build');
		T.Settings.addSection('General', fieldset);
	}

	/**
	 *
	 */
	function showExtensions(index, init)
	{
		extList.empty();
		var selected = versions[index];
		if (selected && selected.extensions && selected.extensions.length) {
			Array.each(selected.extensions, function(extension, index) {
				new Element('li', {children: [
					new Element('input[type=checkbox]', {id: 'extension-'+index, name: 'extensions[]', value: extension.id}),
					new Element('label', {'for': 'extension-'+index, text: extension.name})
				]}).inject(extList);
			});
		}
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);


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

	var assets = [], assetList;

	T.Events.addEvent('settings.build', build);
	T.Events.addEvent('asset.remove', removeAsset);

	/**
	 *
	 */
	function build()
	{
		// log('settings.assets.build();');

		var html = '<ul id="asset-add">'
			+'<li><input placeholder="Enter the URL to a file"><a href="#" class="button primary">&#10010;</a></li>'
			+'</ul><ul id="asset-list"></ul>';
		var fieldset = new Element('fieldset.settings-assets', {html: html}),
			input = fieldset.getElement('input'),
			addButton = fieldset.getElement('a');
		assetList = fieldset.getElement('#asset-list');

		if (T.Tinker.assets && T.Tinker.assets.length) {
			Array.each(T.Tinker.assets, function(url) {
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

		T.Settings.addSection('Assets', fieldset);
	}

	/**
	 *
	 */
	function addAsset(url)
	{
		// log('settings.assets.addAsset(', url, ');');

		if (url === '') {
			return false;
		}

		var asset = new T.Asset(url);
		assets.push(asset);
		assetList.adopt(asset.element);

		return true;
	}

	/**
	 *
	 */
	function removeAsset(asset)
	{
		// log('settings.assets.removeAsset(', asset, ');');

		assets.splice(assets.indexOf(asset), 1);
	}



	/**
	 *
	 */
	T.Asset = new Class({
		/**
		 *
		 */
		initialize: function(url)
		{
			// log('T.Asset.initialize(', url, ');');

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

		/**
		 *
		 */
		remove: function(e)
		{
			// log('T.Asset.remove();');

			e.stop();
			this.element.destroy();
			T.Events.fireEvent('asset.remove', this);
		}
	});

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);


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

	T.Events.addEvent('settings.build', build);

	/**
	 *
	 */
	function build()
	{
		log('settings.info.build();');

		var html = '<ul>'
			+'<li><label for="input-title">Title</label><input id="input-title" name="title" value="'+(T.Tinker.title || '')+'"></li>'
			+'<li><label for="input-description">Description</label><textarea id="input-description" name="description">'+(T.Tinker.description || '')+'</textarea></li>'
			+'</ul>';
		var fieldset = new Element('fieldset.settings-info', {html: html});

		T.Settings.addSection('Info', fieldset);
	}

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

