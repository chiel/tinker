/**
 *
 */
TP.Core = {
	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('init', this.init.bind(this));
		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	init: function(config)
	{
		// log('TP.Core.init(', config, ');');
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Core.build();');

		var aboutButton;
		TP.Layout.addToRegion(new Element('ul.buttons', {
			children: new Element('li', {
				children: aboutButton = new Element('a.button.about[href=#about][text=About]')
			})
		}), 'br');

		var html = '<p>Tinker comes from <a href="https://twitter.com/#!/chielkunkels">@chielkunkels</a> '
			+'and <a href="https://twitter.com/#!/ponjoh">@ponjoh</a>.</p><p>Check out the code on '
			+'<a href="http://git.io/tinker">Github</a> and follow '
			+'<a href="https://twitter.com/#!/tinker_io">@tinker_io</a> on Twitter.</p>';
		var contents = new Element('div#about', {html: html});

		new TP.Popover(contents, {button: aboutButton, anchor: 'br'});
	}
};
TP.Core.prepare();



/**
 *
 */
TP.Tinker = {
	/**
	 *
	 */
	markup: null,
	style: null,
	interaction: null,

	//
	inputHash: null,
	inputRevision: null,

	/**
	 *
	 */
	prepare: function()
	{
		TP.Events.addEvent('init', this.init.bind(this));
	},

	/**
	 * Store data for the current tinker
	 */
	init: function()
	{
		// log('TP.Tinker.init(', config, ');');

		var data = JSON.parse(document.getElement('script[type=tinker]').get('html'));
		this.hash = data.hash || null;
		this.revision = data.revision || null;
		this.doctype = data.revision || null;
		this.framework = data.framework || null;
		this.normalize = data.normalize || null;
		this.assets = data.assets || [];
		this.title = data.title || null;
		this.description = data.description || null;
		this.markup = data.markup || null;
		this.style = data.style || null;
		this.interaction = data.interaction || null;

		if (this.hash) {
			TP.Events.addEvent('result.build', this.run.bind(this));
			// @todo only do this when the revision is not in the url yet
			if (!!(window.history && history.pushState)) {
				var url = '/'+this.hash;
				url += this.revision > 0 ? '/'+this.revision : '';
				history.pushState(null, null, url);
			}
		}
		TP.Events.addEvent('layout.build', this.build.bind(this));
	},

	/**
	 *
	 */
	build: function()
	{
		// log('TP.Tinker.build();');

		var self = this;
		var buttons = $$(
			new Element('a.button.run[href=#run][text=Run]'),
			new Element('a.button.primary.save[href=#save][text=Save]')
		).map(function(el) {
			return new Element('li').adopt(el);
		});

		TP.Layout.addToRegion(new Element('ul.buttons', {
			children: buttons,
			events: {
				click: function(e) {
					e.preventDefault();
					var href = e.target.get('href');
					if (href === '#run') {
						self.run();
					} else if (href === '#save') {
						self.save();
					}
				}
			}
		}), 'tr');

		TP.Layout.wrapper.adopt(
			this.inputHash = new Element('input[type=hidden]', {name: 'hash', value: this.hash}),
			this.inputRevision = new Element('input[type=hidden]', {name: 'revision', value: this.revision})
		);
	},

	/**
	 * Run the current tinker in the result frame
	 */
	run: function()
	{
		// log('TP.Tinker.run();');

		TP.Events.fireEvent('tinker.save');
		TP.Layout.wrapper.submit();
	},

	/**
	 * Save the current tinker
	 */
	save: function()
	{
		// log('TP.Tinker.save();');

		TP.Events.fireEvent('tinker.save');
		TP.Layout.wrapper.submit();

		var self = this;
		new Request.JSON({
			url: '/save',
			data: TP.Layout.wrapper,
			method: 'post',
			onSuccess: function(response) {
				if (response.status === 'ok') {
					self.hash = response.hash;
					self.revision = response.revision;

					self.inputHash.set('value', self.hash);
					self.inputRevision.set('value', self.revision);

					var url = '/'+self.hash;
					url += self.revision > 0 ? '/'+self.revision : '';

					if (!!(window.history && history.pushState)) {
						history.pushState(null, null, url);
					} else {
						window.location = url;
					}
				} else if (response.status === 'error') {
					log(response.error.message);
				}
			}
		}).send();
	}
};
TP.Tinker.prepare();

