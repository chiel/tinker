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

	T.Settings = {
		addSection: addSection
	};

	T.Events.addEvent('layout.build', build);

	var wrapper, tabWrapper, sectionWrapper, tabs = [], sections = [], activeTab = null;

	/**
	 *
	 */
	function build()
	{
		log('settings.build();');

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
		new T.Popover(wrapper, {button: ul.getElement('.settings')});
	}

	/**
	 *
	 */
	function addSection(name, content)
	{
		log('settings.addSection(', name, content, ');');

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

		// build: function()
		// {
		// 	// log('T.Settings.build();');

		// 	var self = this, settingsButton;
		// 	T.Layout.addToRegion(new Element('ul.buttons', {
		// 		children: new Element('li', {
		// 			children: settingsButton = new Element('a.button.settings[href=#settings][text=Settings]')
		// 		})
		// 	}), 'tl');

		// 	var contents = new Element('div', {
		// 		children: [
		// 			this.tabWrapper = new Element('ul.tabs', {
		// 				children: [
		// 					new Element('li', {children: this.tabs.general = new Element('a.is-active[href=#settings-general]', {text: 'General'})}),
		// 					new Element('li', {children: this.tabs.assets = new Element('a[href=#settings-assets]', {text: 'Assets'})}),
		// 					new Element('li', {children: this.tabs.info = new Element('a[href=#settings-info]', {text: 'Info'})})
		// 				]
		// 			}),
		// 			this.panes.general = new Element('div.settings-general'),
		// 			this.panes.assets = new Element('div.settings-assets.is-hidden'),
		// 			this.panes.info = new Element('div.settings-info.is-hidden')
		// 		]
		// 	});

		// 	this.tabWrapper.addEvent('click', function(e) {
		// 		if (e.target.get('tag') === 'a') {
		// 			e.preventDefault();
		// 			var pane = e.target.get('href').replace(/\#settings-/, '');
		// 			self.tabs[self.activePane].removeClass('is-active');
		// 			self.panes[self.activePane].addClass('is-hidden');
		// 			self.tabs[pane].addClass('is-active');
		// 			self.panes[pane].removeClass('is-hidden');
		// 			self.activePane = pane;
		// 		}
		// 	});

		// 	T.Events.fireEvent('settings.build');
		// 	new T.Popover(contents, {button: settingsButton});
		// }

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

	var doctypes = [], frameworks = [], versions = {};

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
		log('settings.general.build();');

		var html = '<ul>'
			+'<li><label for="input-doctype">Doctype</label><select id="input-doctype" name="doctype"></select></li>'
			+'<li><label for="input-js-framework">JS Framework</label><select id="input-js-framework" name="js-framework"><option value="0">None</value></select><ul id="extension-list"></ul></li>'
			+'<li><label for="input-css-framework">CSS</label><select id="input-css-framework" name="css-framework"><option value="0">None</option></select></li>'
			+'</ul>';
		var fieldset = new Element('fieldset.settings-general', {html: html}),
			inputDoctype = fieldset.getElement('#input-doctype'),
			inputJS = fieldset.getElement('#input-js-framework'),
			inputCSS = fieldset.getElement('#input-css-framework'),
			extList = fieldset.getElement('#extension-list');

		inputJS.addEvent('change', function(e) {
			extList.empty();
			var selected = versions[inputJS.getSelected()[0].get('value')];
			if (selected && selected.extensions && selected.extensions.length) {
				Array.each(selected.extensions, function(extension, index) {
					new Element('li', {children: [
						new Element('input[type=checkbox]', {id: 'extension-'+index, name: 'extensions[]', value: extension.id}),
						new Element('label', {'for': 'extension-'+index, text: extension.name})
					]}).inject(extList);
				});
			}
		});

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
		log('settings.assets.build();');

		var fieldset = new Element('fieldset.settings-assets');

		T.Settings.addSection('Assets', fieldset);
	}



	/**
	 *
	 */
	T.Settings.Assets = {
		/**
		 * List of all the assets we've added so far
		 */
		assets: [],
		/**
		 *
		 */
		wrapper: null,
		input: null,
		addButton: null,
		assetList: null,

		/**
		 *
		 */
		prepare: function()
		{
			T.Events.addEvent('settings.build', this.build.bind(this));
			T.Events.addEvent('asset.remove', this.removeAsset.bind(this));
		},

		/**
		 *
		 */
		build: function()
		{
			var self = this;

			T.Settings.panes.assets.adopt(
				this.wrapper = new Element('fieldset', {
					children: [
						new Element('ul', {
							children: new Element('li', {
								children: [
									this.input = new Element('input'),
									this.addButton = new Element('a[text=Add][href=#]')
								]
							})
						}),
						this.assetList = new Element('ul#asset_list')
					]
				})
			);

			if (T.Tinker.assets) {
				Array.each(T.Tinker.assets, function(asset) {
					self.addAsset(asset);
				});
			}

			this.addButton.addEvent('click', function(e) {
				e.preventDefault();
				var url = self.input.get('value').trim();

				self.addAsset(url);
				self.input.set('value', '');
			});
		},

		/**
		 *
		 */
		addAsset: function(url)
		{
			log('T.Settings.Assets.addAsset(', url, ');');

			if (url === '') {
				return;
			}

			var asset = new T.Asset(url);
			this.assets.push(asset);
			this.assetList.adopt(asset.element);
		},

		/**
		 *
		 */
		removeAsset: function(asset)
		{
			this.assets.splice(this.assets.indexOf(asset), 1);
			log(this.assets);
		}
	};
	// T.Settings.Assets.prepare();

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
					new Element('span', {text: this.name}),
					new Element('a.delete[href=#]').addEvent('click', this.remove.bind(this)),
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

		var fieldset = new Element('fieldset.settings-info');

		T.Settings.addSection('Info', fieldset);
	}



	/**
	 *
	 */
	T.Settings.Info = {
		/**
		 *
		 */
		prepare: function()
		{
			T.Events.addEvent('settings.build', this.build.bind(this));
		},

		/**
		 *
		 */
		build: function()
		{
			T.Settings.panes.info.adopt(
				new Element('fieldset', {
					children: new Element('ul', {
						children: [
							new Element('li', {
								children: [
									new Element('label[for=input-title]', {text: 'Title'}),
									new Element('input[id=input-title][name=title]', {
										value: T.Tinker.title || ''
									})
								]
							}),
							new Element('li', {
								children: [
									new Element('label[for=input-description]', {text: 'Description'}),
									new Element('textarea[id=input-description][name=description]', {
										value: T.Tinker.description || ''
									})
								]
							})
						]
					})
				})
			);
		}
	};
	// T.Settings.Info.prepare();

}(typeof Tinker == 'undefined' ? (window.Tinker = {}) : Tinker);

