// packager build Custom-Event/* Mobile/Browser.Mobile Mobile/Mouse Mobile/Click Mobile/Pinch Mobile/Swipe Mobile/Touchhold Class-Extras/* History/History.handleInitialState Mootilities/* Form-AutoGrow/* Form-Placeholder/* EventStack/EventStack.OuterClick Tree/Tree Tree/Collapse.Cookie Tree/Collapse.LocalStorage ScrollLoader/* Interface/*
/*
---

name: Element.defineCustomEvent

description: Allows to create custom events based on other custom events.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Element.Event]

provides: Element.defineCustomEvent

...
*/

(function(){

[Element, Window, Document].invoke('implement', {hasEvent: function(event){
	var events = this.retrieve('events'),
		list = (events && events[event]) ? events[event].values : null;
	if (list){
		var i = list.length;
		while (i--) if (i in list){
			return true;
		}
	}
	return false;
}});

var wrap = function(custom, method, extended){
	method = custom[method];
	extended = custom[extended];

	return function(fn, name){
		if (extended && !this.hasEvent(name)) extended.call(this, fn, name);
		if (method) method.call(this, fn, name);
	};
};

var inherit = function(custom, base, method){
	return function(fn, name){
		base[method].call(this, fn, name);
		custom[method].call(this, fn, name);
	};
};

var events = Element.Events;

Element.defineCustomEvent = function(name, custom){
	var base = events[custom.base];

	custom.onAdd = wrap(custom, 'onAdd', 'onSetup');
	custom.onRemove = wrap(custom, 'onRemove', 'onTeardown');

	events[name] = base ? Object.append({}, custom, {

		base: base.base,

		condition: function(event, name){
			return (!base.condition || base.condition.call(this, event, name)) &&
				(!custom.condition || custom.condition.call(this, event, name));
		},

		onAdd: inherit(custom, base, 'onAdd'),
		onRemove: inherit(custom, base, 'onRemove')

	}) : custom;

	return this;
};

Element.enableCustomEvents = function(){
  Object.each(events, function(event, name){
    if (event.onEnable) event.onEnable.call(event, name);
  });
};

Element.disableCustomEvents = function(){
  Object.each(events, function(event, name){
    if (event.onDisable) event.onDisable.call(event, name);
  });
};

})();


/*
---

name: Browser.Mobile

description: Provides useful information about the browser environment

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Browser]

provides: Browser.Mobile

...
*/

(function(){

Browser.Device = {
	name: 'other'
};

if (Browser.Platform.ios){
	var device = navigator.userAgent.toLowerCase().match(/(ip(ad|od|hone))/)[0];

	Browser.Device[device] = true;
	Browser.Device.name = device;
}

if (this.devicePixelRatio == 2)
	Browser.hasHighResolution = true;

Browser.isMobile = !['mac', 'linux', 'win'].contains(Browser.Platform.name);

}).call(this);


/*
---

name: Browser.Features.Touch

description: Checks whether the used Browser has touch events

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Browser]

provides: Browser.Features.Touch

...
*/

Browser.Features.Touch = (function(){
	try {
		document.createEvent('TouchEvent').initTouchEvent('touchstart');
		return true;
	} catch (exception){}

	return false;
})();

// Android doesn't have a touch delay and dispatchEvent does not fire the handler
Browser.Features.iOSTouch = (function(){
	var name = 'cantouch', // Name does not matter
		html = document.html,
		hasTouch = false;

	if (!html.addEventListener) return false;

	var handler = function(){
		html.removeEventListener(name, handler, true);
		hasTouch = true;
	};

	try {
		html.addEventListener(name, handler, true);
		var event = document.createEvent('TouchEvent');
		event.initTouchEvent(name);
		html.dispatchEvent(event);
		return hasTouch;
	} catch (exception){}

	handler(); // Remove listener
	return false;
})();


/*
---

name: Mouse

description: Maps mouse events to their touch counterparts

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Custom-Event/Element.defineCustomEvent, Browser.Features.Touch]

provides: Mouse

...
*/

if (!Browser.Features.Touch) (function(){

var condition = function(event){
	event.targetTouches = [];
	event.changedTouches = event.touches = [{
		pageX: event.page.x, pageY: event.page.y,
		clientX: event.client.x, clientY: event.client.y
	}];

	return true;
};

Element.defineCustomEvent('touchstart', {

	base: 'mousedown',

	condition: condition

}).defineCustomEvent('touchmove', {

	base: 'mousemove',

	condition: condition

}).defineCustomEvent('touchend', {

	base: 'mouseup',

	condition: condition

});

})();


/*
---

name: Touch

description: Provides a custom touch event on mobile devices

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Element.Event, Custom-Event/Element.defineCustomEvent, Browser.Features.Touch]

provides: Touch

...
*/

(function(){

var preventDefault = function(event){
	if (!event.target || event.target.tagName.toLowerCase() != 'select')
		event.preventDefault();
};

var disabled;

Element.defineCustomEvent('touch', {

	base: 'touchend',

	condition: function(event){
		if (disabled || event.targetTouches.length != 0) return false;

		var touch = event.changedTouches[0],
			target = document.elementFromPoint(touch.clientX, touch.clientY);

		do {
			if (target == this) return true;
		} while (target && (target = target.parentNode));

		return false;
	},

	onSetup: function(){
		this.addEvent('touchstart', preventDefault);
	},

	onTeardown: function(){
		this.removeEvent('touchstart', preventDefault);
	},

	onEnable: function(){
		disabled = false;
	},

	onDisable: function(){
		disabled = true;
	}

});

})();


/*
---

name: Click

description: Provides a replacement for click events on mobile devices

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Touch]

provides: Click

...
*/

if (Browser.Features.iOSTouch) (function(){

var name = 'click';
delete Element.NativeEvents[name];

Element.defineCustomEvent(name, {

	base: 'touch'

});

})();


/*
---

name: Pinch

description: Provides a custom pinch event for touch devices

authors: Christopher Beloch (@C_BHole), Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Element.Event, Custom-Event/Element.defineCustomEvent, Browser.Features.Touch]

provides: Pinch

...
*/

if (Browser.Features.Touch) (function(){

var name = 'pinch',
	thresholdKey = name + ':threshold',
	disabled, active;

var events = {

	touchstart: function(event){
		if (event.targetTouches.length == 2) active = true;
	},

	touchmove: function(event){
		event.preventDefault();

		if (disabled || !active) return;

		var threshold = this.retrieve(thresholdKey, 0.5);
		if (event.scale < (1 + threshold) && event.scale > (1 - threshold)) return;

		active = false;
		event.pinch = (event.scale > 1) ? 'in' : 'out';
		this.fireEvent(name, event);
	}

};

Element.defineCustomEvent(name, {

	onSetup: function(){
		this.addEvents(events);
	},

	onTeardown: function(){
		this.removeEvents(events);
	},

	onEnable: function(){
		disabled = false;
	},

	onDisable: function(){
		disabled = true;
	}

});

})();


/*
---

name: Swipe

description: Provides a custom swipe event for touch devices

authors: Christopher Beloch (@C_BHole), Christoph Pojer (@cpojer), Ian Collins (@3n)

license: MIT-style license.

requires: [Core/Element.Event, Custom-Event/Element.defineCustomEvent, Browser.Features.Touch]

provides: Swipe

...
*/

(function(){

var name = 'swipe',
	distanceKey = name + ':distance',
	cancelKey = name + ':cancelVertical',
	dflt = 50;

var start = {}, disabled, active;

var clean = function(){
	active = false;
};

var events = {

	touchstart: function(event){
		if (event.touches.length > 1) return;

		var touch = event.touches[0];
		active = true;
		start = {x: touch.pageX, y: touch.pageY};
	},

	touchmove: function(event){
		if (disabled || !active) return;

		var touch = event.changedTouches[0],
			end = {x: touch.pageX, y: touch.pageY};
		if (this.retrieve(cancelKey) && Math.abs(start.y - end.y) > 10){
			active = false;
			return;
		}

		var distance = this.retrieve(distanceKey, dflt),
			delta = end.x - start.x,
			isLeftSwipe = delta < -distance,
			isRightSwipe = delta > distance;

		if (!isRightSwipe && !isLeftSwipe)
			return;

		event.preventDefault();
		active = false;
		event.direction = (isLeftSwipe ? 'left' : 'right');
		event.start = start;
		event.end = end;

		this.fireEvent(name, event);
	},

	touchend: clean,
	touchcancel: clean

};

Element.defineCustomEvent(name, {

	onSetup: function(){
		this.addEvents(events);
	},

	onTeardown: function(){
		this.removeEvents(events);
	},

	onEnable: function(){
		disabled = false;
	},

	onDisable: function(){
		disabled = true;
		clean();
	}

});

})();


/*
---

name: Touchhold

description: Provides a custom touchhold event for touch devices

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Element.Event, Custom-Event/Element.defineCustomEvent, Browser.Features.Touch]

provides: Touchhold

...
*/

(function(){

var name = 'touchhold',
	delayKey = name + ':delay',
	disabled, timer;

var clear = function(e){
	clearTimeout(timer);
};

var events = {

	touchstart: function(event){
		if (event.touches.length > 1){
			clear();
			return;
		}

		timer = (function(){
			this.fireEvent(name, event);
		}).delay(this.retrieve(delayKey) || 750, this);
	},

	touchmove: clear,
	touchcancel: clear,
	touchend: clear

};

Element.defineCustomEvent(name, {

	onSetup: function(){
		this.addEvents(events);
	},

	onTeardown: function(){
		this.removeEvents(events);
	},

	onEnable: function(){
		disabled = false;
	},

	onDisable: function(){
		disabled = true;
		clear();
	}

});

})();


/*
---

name: Class.Binds

description: A clean Class.Binds Implementation

authors: Scott Kyle (@appden), Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class, Core/Function]

provides: Class.Binds

...
*/

Class.Binds = new Class({

	$bound: {},

	bound: function(name){
		return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
	}

});

/*
---

name: Class.Instantiate

description: Simple Wrapper for Mass-Class-Instantiation

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class]

provides: Class.Instantiate

...
*/

Class.Instantiate = function(klass, options){
	var create = function(object){
		if (object.getInstanceOf && object.getInstanceOf(klass)) return;
		new klass(object, options);
	};

	return function(objects){
		objects.each(create);
	};
};

/*
---

name: Class.Singleton

description: Beautiful Singleton Implementation that is per-context or per-object/element

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class]

provides: Class.Singleton

...
*/

(function(){

var storage = {

	storage: {},

	store: function(key, value){
		this.storage[key] = value;
	},

	retrieve: function(key){
		return this.storage[key] || null;
	}

};

Class.Singleton = function(){
	this.$className = String.uniqueID();
};

Class.Singleton.prototype.check = function(item){
	if (!item) item = storage;

	var instance = item.retrieve('single:' + this.$className);
	if (!instance) item.store('single:' + this.$className, this);

	return instance;
};

var gIO = function(klass){

	var name = klass.prototype.$className;

	return name ? this.retrieve('single:' + name) : null;

};

if (('Element' in this) && Element.implement) Element.implement({getInstanceOf: gIO});

Class.getInstanceOf = gIO.bind(storage);

})();

/*
---

name: Class.Properties

description: Provides getters/setters sugar for your class properties.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class, Core/String]

provides: Class.Properties

...
*/

(function(){

var setter = function(name){
	return function(value){
		this[name] = value;
		return this;
	};
};

var getter = function(name){
	return function(){
		return this[name] || null;
	};
};

Class.Mutators.Properties = function(properties){
	this.implement(properties);

	for (var prop in properties){
		var name = prop.replace(/^_+/, '').capitalize().camelCase();
		this.implement('set' + name, setter(prop));
		this.implement('get' + name, getter(prop));
	}
};

})();


/*
---

name: History

description: History Management via popstate or hashchange.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Events, Core/Element.Event, Class-Extras/Class.Binds]

provides: History

...
*/

(function(){

var events = Element.NativeEvents,
	location = window.location,
	base = location.pathname,
	history = window.history,
	hasPushState = ('pushState' in history),
	event = hasPushState ? 'popstate' : 'hashchange';

this.History = new new Class({

	Implements: [Class.Binds, Events],

	initialize: hasPushState ? function(){
		events[event] = 2;
		window.addEvent(event, this.bound('pop'));
	} : function(){
		events[event] = 1;
		window.addEvent(event, this.bound('pop'));

		this.hash = location.hash;
		var hashchange = ('onhashchange' in window);
		if (!(hashchange && (document.documentMode === undefined || document.documentMode > 7)))
			this.timer = this.check.periodical(200, this);
	},

	push: hasPushState ? function(url, title, state){
		if (base && base != url) base = null;

		history.pushState(state || null, title || null, url);
		this.onChange(url, state);
	} : function(url){
		location.hash = url;
	},

	replace: hasPushState ? function(url, title, state){
		history.replaceState(state || null, title || null, url);
	} : function(url){
		this.hash = '#' + url;
		this.push(url);
	},

	pop: hasPushState ? function(event){
		var url = location.pathname;
		if (url == base){
			base = null;
			return;
		}
		this.onChange(url, event.event.state);
	} : function(){
		var hash = location.hash;
		if (this.hash == hash) return;

		this.hash = hash;
		this.onChange(hash.substr(1));
	},

	onChange: function(url, state){
		this.fireEvent('change', [url, state || {}]);
	},

	back: function(){
		history.back();
	},

	forward: function(){
		history.forward();
	},

	getPath: function(){
		return hasPushState ? location.pathname : location.hash.substr(1);
	},

	hasPushState: function(){
		return hasPushState;
	},

	check: function(){
		if (this.hash != location.hash) this.pop();
	}

});

}).call(this);


/*
---

name: History.handleInitialState

description: Provides a helper method to handle the initial state of your application.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [History]

provides: History.handleInitialState

...
*/

History.handleInitialState = function(base){
	if (!base) base = '';
	var location = window.location,
		pathname = location.pathname.substr(base.length),
		hash = location.hash,
		hasPushState = History.hasPushState();

	if (!hasPushState && pathname.length > 1){
		window.location = (base || '/') + '#' + pathname;
		return true;
	}

	if (!hash || hash.length <= 1) return false;
	if (hasPushState){
		(function(){
			History.push(hash.substr(1));
		}).delay(1);
		return false;
	}

	if (!pathname || pathname == '/') return false;
	window.location = (base || '/') + hash;
	return true;
};


/*
---

name: Accessor

description: Adds define/lookup for anything on your objects. Backport of a 2.0 component.

authors: Valerio Proietti (@kamicane)

license: MIT-style license.

requires: [Core/Object]

provides: Accessor

...
*/

(function(){

this.Accessor = function(singular, plural){
	if (!singular) singular = '';
	if (!plural) plural = singular + 's';

	var accessor = {}, matchers = [],
		define = 'define', lookup = 'lookup', match = 'match', each = 'each';

	this[define + singular] = function(key, value){
		if (typeOf(key) == 'regexp') matchers.push({regexp: key, value: value, type: typeOf(value)});
		else accessor[key] = value;
		return this;
	};

	this[define + plural] = function(object){
		for (var key in object) accessor[key] = object[key];
		return this;
	};

	var lookupSingular = this[lookup + singular] = function(key){
		if (accessor.hasOwnProperty(key)) return accessor[key];
		for (var l = matchers.length; l--; l){
			var matcher = matchers[l], matched = key.match(matcher.regexp);
			if (matched && (matched = matched.slice(1))){
				if (matcher.type == 'function') return function(){
					return matcher.value.apply(this, Array.from(arguments).concat(matched));
				}; else return matcher.value;
			}
		}
		return null;
	};

	this[lookup + plural] = function(){
		var results = {};
		for (var i = 0; i < arguments.length; i++){
			var argument = arguments[i];
			results[argument] = lookupSingular(argument);
		}
		return results;
	};

	this[each + singular] = function(fn, bind){
		Object.forEach(accessor, fn, bind);
	};

};

})();


/*
---

name: Listener

description: Attach listeners to your elements and detach them all at once easily.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class.Extras, Core/Element.Event]

provides: Listener

...
*/

(function(){

var property = '$' + String.uniqueID() + '-listener';
var setup = function(element){
	var listener = new Events, removeEvent = listener.removeEvent;
	listener.removeEvent = function(key, value){
		removeEvent.call(this, key, value);
		element.removeEvent(key, value);
	};
	return listener;
};

this.Listener = new Class({

	attach: function(key, value){
		if (!this[property]) this[property] = setup(this.toElement());
		this[property].addEvent(key, value);
		this.toElement().addEvent(key, value);
	}.overloadSetter(),

	detach: function(key, value){
		if (this[property]){
			if (typeof key == 'string') this[property].removeEvent(key, value);
			else this[property].removeEvents(key);
		}
		return this;
	},

	toElement: function(){
		return this.element;
	}

});

})();


/*
---

name: LocalStorage

description: Simple localStorage wrapper. Does not even attempt to be a fancy plugin.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Cookie, Core/JSON]

provides: LocalStorage

...
*/

(function(){

var storage, set, get, erase;
if ('localStorage' in this) {
	storage = this.localStorage;
	set = function(key, value){
		storage.setItem(key, JSON.encode(value));
		return this;
	};

	get = function(key){
		return JSON.decode(storage.getItem(key));
	};

	erase = function(key){
		storage.removeItem(key);
		return this;
	}.overloadGetter();
} else {
	storage = this.Cookie;
	set = function(key, value){
		storage.write(key, JSON.encode(value));
		return this;
	};

	get = function(key){
		return JSON.decode(storage.read(key));
	};

	erase = function(key){
		storage.dispose(key);
		return this;
	}.overloadGetter();
}

this.LocalStorage = {
	set: set.overloadSetter(),
	get: get.overloadGetter(),
	erase: function(){
		erase.apply(this, arguments);
		return this;
	}
};

})();


/*
---

name: Queue

description: A really really lightweight queuing system.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class.Extras, Class-Extras/Class.Binds]

provides: Queue

...
*/

(function(){

this.Queue = new Class({

	Extends: Chain,

	Implements: Class.Binds,

	call: function(){
		if (this.busy || !this.$chain.length) return this;

		this.busy = true;
		this.callChain();
		return this;
	},

	next: function(){
		this.busy = false;
		this.call();
		return this;
	}

});

})();


/*
---

name: Stratcom

description: The simplest form of notifying other parts of your app about cool stuff. Will be more awesome in the future.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class.Extras]

provides: Stratcom

...
*/

(function(){

var bag = new Events;
this.Stratcom = {

	notify: function(type, args){
		bag.fireEvent(type, args);
		return this;
	},

	listen: function(type, fn){
		bag.addEvent(type, fn);
		return this;
	}.overloadSetter(),

	ignore: function(type, fn){
		bag.removeEvent(type, fn);
		return this;
	}.overloadSetter()

};

})();


/*
---

name: Form.AutoGrow

description: Automatically resizes textareas based on their content.

authors: Christoph Pojer (@cpojer)

credits: Based on a script by Gary Glass (www.bookballoon.com)

license: MIT-style license.

requires: [Core/Class.Extras, Core/Element, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions, Class-Extras/Class.Binds, Class-Extras/Class.Singleton]

provides: Form.AutoGrow

...
*/

(function(){

var wrapper = new Element('div').setStyles({
	overflowX: 'hidden',
	position: 'absolute',
	top: 0,
	left: -9999
});

var escapeHTML = function(string){
	return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

if (!this.Form) this.Form = {};

var AutoGrow = this.Form.AutoGrow = new Class({

	Implements: [Options, Class.Singleton, Class.Binds],

	options: {
		minHeightFactor: 2,
		margin: 0
	},

	initialize: function(element, options){
		this.setOptions(options);
		element = this.element = document.id(element);

		return this.check(element) || this.setup();
	},

	setup: function(){
		this.attach().focus().resize();
	},

	toElement: function(){
		return this.element;
	},

	attach: function(){
		this.element.addEvents({
			focus: this.bound('focus'),
			keydown: this.bound('keydown'),
			scroll: this.bound('scroll')
		});

		return this;
	},

	detach: function(){
		this.element.removeEvents({
			focus: this.bound('focus'),
			keydown: this.bound('keydown'),
			scroll: this.bound('scroll')
		});

		return this;
	},

	focus: function(){
		wrapper.setStyles(this.element.getStyles('fontSize', 'fontFamily', 'width', 'lineHeight', 'padding')).inject(document.body);

		this.minHeight = (wrapper.set('html', 'A').getHeight() + this.options.margin) * this.options.minHeightFactor;

		return this;
	},

	keydown: function(){
		this.resize.delay(15, this);
	},

	resize: function(){
		var element = this.element,
			html = escapeHTML(element.get('value')).replace(/\n|\r\n/g, '<br/>A');

		if (wrapper.get('html') == html) return this;

		wrapper.set('html', html);
		var height = wrapper.getHeight() + this.options.margin;
		if (element.getHeight() != height){
			element.setStyle('height', this.minHeight.max(height));

			AutoGrow.fireEvent('resize', [this]);
		}

		return this;
	},

	scroll: function(){
		this.element.scrollTo(0, 0);
	}

});

AutoGrow.extend(new Events);

}).call(this);


/*
---

name: Form.Placeholder

description: Provides a fallback for the placeholder property on input elements for older browsers.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class.Extras, Core/Element, Core/Element.Event, Core/Element.Style, Class-Extras/Class.Binds, Class-Extras/Class.Singleton]

provides: Form.Placeholder

...
*/

(function(){

if (!this.Form) this.Form = {};

var supportsPlaceholder = ('placeholder' in document.createElement('input'));
if (!('supportsPlaceholder' in this) && this.supportsPlaceholder !== false && supportsPlaceholder) return;

var wrapSet = function(set, self){
	return function(key, value){
		if (key == 'value' && !value){
			self.reset();
			return this;
		}

		return set.apply(this, arguments);
	};
};

var wrapGet = function(get, self){
	return function(key){
		if (key == 'value' && !self.hasValue())
			return '';

		return get.apply(this, arguments);
	};
};

this.Form.Placeholder = new Class({

	Implements: [Class.Singleton, Class.Binds, Options],

	options: {
		color: '#777'
	},

	initialize: function(element, options){
		this.setOptions(options);
		element = this.element = document.id(element);

		return this.check(element) || this.setup();
	},

	setup: function(){
		var element = this.element;

		this.defaultValue = element.get('placeholder') || element.value;
		this.color = element.getStyle('color');

		element.erase('placeholder');
		element.set = wrapSet(element.set, this);
		element.get = wrapGet(element.get, this);

		this.attach();

		if (!this.hasValue()) this.reset();
	},

	attach: function(){
		this.element.addEvents({
			focus: this.bound('focus'),
			blur: this.bound('blur')
		});

		return this;
	},

	detach: function(){
		this.element.removeEvents({
			focus: this.bound('focus'),
			blur: this.bound('blur')
		});

		return this;
	},

	clear: function(){
		var element = this.element;
		element.setStyle('color', this.color);
		if (element.value == this.defaultValue) element.value = '';

		return this;
	},

	reset: function(){
		this.element.setStyle('color', this.options.color).value = this.defaultValue;

		return this;
	},

	focus: function(){
		this.clear();
	},

	blur: function(){
		if (!this.element.value) this.reset();
	},

	hasValue: function(){
		var value = this.element.value;
		return (value && value != this.defaultValue);
	}

});

}).call(this);


/*
---

name: EventStack

description: Helps you Escape.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class.Extras, Core/Element.Event, Class-Extras/Class.Binds]

provides: EventStack

...
*/

(function(){

this.EventStack = new Class({

	Implements: [Options, Class.Binds],

	options: {
		event: 'keyup',
		condition: function(event){
			return (event.key == 'esc');
		}
	},

	initialize: function(options){
		this.setOptions(options);
		this.stack = [];
		this.data = [];

		document.addEvent(this.options.event, this.bound('condition'));
	},

	condition: function(event){
		if (this.options.condition.call(this, event, this.data.getLast()))
			this.pop(event);
	},

	erase: function(fn){
		this.data.erase(this.data[this.stack.indexOf(fn)]);
		this.stack.erase(fn);

		return this;
	},

	push: function(fn, data){
		this.erase(fn);
		this.data.push(data || null);
		this.stack.push(fn);

		return this;
	},

	pop: function(event){
		var fn = this.stack.pop(),
			data = this.data.pop();

		if (fn) fn.call(this, event, data);

		return this;
	}

});

}).call(this);


/*
---

name: EventStack.OuterClick

description: Helps you escape from clicks outside of a certain area.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [EventStack]

provides: EventStack.OuterClick

...
*/

EventStack.OuterClick = new Class({

	Extends: EventStack,

	options: {
		event: 'click',
		condition: function(event, element){
			return element && !element.contains(event.target);
		}
	}

});


/*
---

name: Tree

description: Provides a way to sort and reorder a tree via drag&drop.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Events, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions, Core/Fx.Tween, Core/Element.Delegation, More/Drag.Move, Class-Extras/Class.Binds, Class-Extras/Class.Singleton]

provides: Tree

...
*/

(function(){

this.Tree = new Class({

	Implements: [Options, Events, Class.Binds, Class.Singleton],

	options: {
		/*onChange: function(){},*/
		indicatorOffset: 0,
		cloneOffset: {x: 16, y: 16},
		cloneOpacity: 0.8,
		checkDrag: Function.from(true),
		checkDrop: Function.from(true)
	},

	initialize: function(element, options){
		this.setOptions(options);
		element = this.element = document.id(element);
		return this.check(element) || this.setup();
	},

	setup: function(){
		this.indicator = new Element('div.treeIndicator');

		var self = this;
		this.handler = function(e){
			self.mousedown(this, e);
		};

		this.attach();
	},

	attach: function(){
		this.element.addEvent('mousedown:relay(li)', this.handler);
		document.addEvent('mouseup', this.bound('mouseup'));
		return this;
	},

	detach: function(){
		this.element.removeEvent('mousedown:relay(li)', this.handler);
		document.removeEvent('mouseup', this.bound('mouseup'));
		return this;
	},

	mousedown: function(element, event){
		event.preventDefault();

		this.padding = (this.element.getElement('li ul li') || this.element.getElement('li')).getLeft() - this.element.getLeft() + this.options.indicatorOffset;
		if (this.collapse === undefined && typeof Collapse != 'undefined')
			this.collapse = this.element.getInstanceOf(Collapse);

		if(!this.options.checkDrag.call(this, element)) return;
		if (this.collapse && Slick.match(event.target, this.collapse.options.selector)) return;

		this.current = element;
		this.clone = element.clone().setStyles({
			left: event.page.x + this.options.cloneOffset.x,
			top: event.page.y + this.options.cloneOffset.y,
			opacity: this.options.cloneOpacity
		}).addClass('drag').inject(document.body);

		this.clone.makeDraggable({
			droppables: this.element.getElements('li span'),
			onLeave: this.bound('hideIndicator'),
			onDrag: this.bound('onDrag'),
			onDrop: this.bound('onDrop')
		}).start(event);
	},

	mouseup: function(){
		if (this.clone) this.clone.destroy();
	},

	onDrag: function(el, event){
		clearTimeout(this.timer);
		if (this.previous) this.previous.fade(1);
		this.previous = null;

		if (!event || !event.target) return;

		var droppable = (event.target.get('tag') == 'li') ? event.target : event.target.getParent('li');
		if (!droppable || this.element == droppable || !this.element.contains(droppable)) return;

		if (this.collapse) this.expandCollapsed(droppable);

		var coords = droppable.getCoordinates(),
			marginTop =  droppable.getStyle('marginTop').toInt(),
			center = coords.top + marginTop + (coords.height / 2),
			isSubnode = (event.page.x > coords.left + this.padding),
			position = {
				x: coords.left + (isSubnode ? this.padding : 0),
				y: coords.top
			};

		var drop;
		if ([droppable, droppable.getParent('li')].contains(this.current)){
			this.drop = {};
		} else if (event.page.y >= center){
			position.y += coords.height;
			drop = {
				target: droppable,
				where: 'after',
				isSubnode: isSubnode
			};
			if (!this.options.checkDrop.call(this, droppable, drop)) return;
			this.setDropTarget(drop);
		} else if (event.page.y < center){
			position.x = coords.left;
			drop = {
				target: droppable,
				where: 'before'
			};
			if (!this.options.checkDrop.call(this, droppable, drop)) return;
			this.setDropTarget(drop);
		}

		if (this.drop.target) this.showIndicator(position);
		else this.hideIndicator();
	},

	onDrop: function(el){
		el.destroy();
		this.hideIndicator();

		var drop = this.drop,
			current = this.current;
		if (!drop || !drop.target) return;

		var previous = current.getParent('li');
		if (drop.isSubnode) current.inject(drop.target.getElement('ul') || new Element('ul').inject(drop.target), 'bottom');
		else current.inject(drop.target, drop.where || 'after');

		if (this.collapse){
			if (previous) this.collapse.updateElement(previous);
			this.collapse.updateElement(drop.target);
		}

		this.fireEvent('change');
	},

	setDropTarget: function(drop){
		this.drop = drop;
	},

	showIndicator: function(position){
		this.indicator.setStyles({
			left: position.x + this.options.indicatorOffset,
			top: position.y
		}).inject(document.body);
	},

	hideIndicator: function(){
		this.indicator.dispose();
	},

	expandCollapsed: function(element){
		var child = element.getElement('ul');
		if (!child || !this.collapse.isCollapsed(child)) return;

		element.set('tween', {duration: 150}).fade(0.5);
		this.previous = element;
		this.timer = (function(){
			element.fade(1);
			this.collapse.expand(element);
		}).delay(300, this);
	},

	serialize: function(fn, base){
		if (!base) base = this.element;
		if (!fn) fn = function(el){
			return el.get('id');
		};

		var result = {};
		base.getChildren('li').each(function(el){
			var child = el.getElement('ul');
			result[fn(el)] = child ? this.serialize(fn, child) : true;
		}, this);
		return result;
	}

});

})();


/*
---

name: Collapse

description: Allows to expand or collapse a list or a tree.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Events, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions, Core/Fx, More/Element.Delegation, Class-Extras/Class.Singleton]

provides: Collapse

...
*/

(function(){

this.Collapse = new Class({

	Implements: [Options, Class.Singleton],

	options: {
		animate: true,
		fadeOpacity: 0.5,
		className: 'collapse',
		selector: 'a.expand',
		listSelector: 'li',
		childSelector: 'ul'
	},

	initialize: function(element, options){
		this.setOptions(options);
		element = this.element = document.id(element);

		return this.check(element) || this.setup();
	},

	setup: function(){
		var self = this;
		this.handler = function(e){
			self.toggle(this, e);
		};

		this.mouseover = function(){
			if (self.hasChildren(this)) this.getElement(self.options.selector).fade(1);
		};

		this.mouseout = function(){
			if (self.hasChildren(this)) this.getElement(self.options.selector).fade(self.options.fadeOpacity);
		};

		this.prepare().attach();
	},

	attach: function(){
		var element = this.element;
		element.addEvent('click:relay(' + this.options.selector + ')', this.handler);
		if (this.options.animate){
			element.addEvent('mouseover:relay(' + this.options.listSelector + ')', this.mouseover);
			element.addEvent('mouseout:relay(' + this.options.listSelector + ')', this.mouseout);
		}
		return this;
	},

	detach: function(){
		this.element.removeEvent('click:relay(' + this.options.selector + ')', this.handler)
				.removeEvent('mouseover:relay(' + this.options.listSelector + ')', this.mouseover)
				.removeEvent('mouseout:relay(' + this.options.listSelector + ')', this.mouseout);
		return this;
	},

	prepare: function(){
		this.prepares = true;
		this.element.getElements(this.options.listSelector).each(this.updateElement, this);
		this.prepares = false;
		return this;
	},

	updateElement: function(element){
		var child = element.getElement(this.options.childSelector),
			icon = element.getElement(this.options.selector);

		if (!this.hasChildren(element)){
			if (!this.options.animate || this.prepares) icon.setStyle('opacity', 0);
			else icon.fade(0);
			return;
		}

		if (this.options.animate) icon.fade(this.options.fadeOpacity);
		else icon.setStyle('opacity', this.options.fadeOpacity);

		if (this.isCollapsed(child)) icon.removeClass('collapse');
		else icon.addClass('collapse');
	},

	hasChildren: function(element){
		var child = element.getElement(this.options.childSelector);
		return (child && child.getChildren().length);
	},

	isCollapsed: function(element){
		return (element.getStyle('display') == 'none');
	},

	toggle: function(element, event){
		if (event) event.preventDefault();

		if (!element.match(this.options.listSelector)) element = element.getParent(this.options.listSelector);

		if (this.isCollapsed(element.getElement(this.options.childSelector))) this.expand(element);
		else this.collapse(element);

		return this;
	},

	expand: function(element){
		element.getElement(this.options.childSelector).setStyle('display', 'block');
		element.getElement(this.options.selector).addClass(this.options.className);
		return this;
	},

	collapse: function(element){
		element.getElement(this.options.childSelector).setStyle('display', 'none');
		element.getElement(this.options.selector).removeClass(this.options.className);
		return this;
	}

});

})();


/*
---

name: Collapse.Persistent

description: Interface to automatically save the state to persistent storage.

authors: [Christoph Pojer (@cpojer), Sean McArthur (@seanmonstar)]

license: MIT-style license.

requires: [Collapse]

provides: Collapse.Persistent

...
*/

(function(){

this.Collapse.Persistent = new Class({

	Extends: this.Collapse,

	options: {

		getAttribute: function(element){
			return element.get('id');
		},

		getIdentifier: function(element){
			return 'collapse_' + element.get('id') + '_' + element.get('class').split(' ').join('_');
		}

	},

	setup: function(){
		this.key = this.options.getIdentifier.call(this, this.element);
		this.state = this.getState();
		this.parent();
	},

	prepare: function(){
		var obj = this.state;
		this.element.getElements(this.options.listSelector).each(function(element){
			if (!element.getElement(this.options.childSelector)) return;

			var state = obj[this.options.getAttribute.call(this, element)];
			if (state == 1) this.expand(element);
			else if (state == 0) this.collapse(element);
		}, this);

		return this.parent();
	},

	getState: function(){
		return {};
	},

	setState: function(element, state){
		this.state[this.options.getAttribute.call(this, element)] = state;
		return this;
	},

	expand: function(element){
		this.parent(element);
		this.setState(element, 1);
		return this;
	},

	collapse: function(element){
		this.parent(element);
		this.setState(element, 0);
		return this;
	}

});

})();


/*
---

name: Collapse.Cookie

description: Automatically saves the collapsed/expanded state in a Cookie.

authors: [Christoph Pojer (@cpojer), Sean McArthur (@seanmonstar)]

license: MIT-style license.

requires: [Core/Cookie, Core/JSON, Collapse.Persistent]

provides: Collapse.Cookie

...
*/

(function(){

this.Collapse.Cookie = new Class({

	Extends: this.Collapse.Persistent,

	getState: function(){
		var self = this;
		return Function.attempt(function(){
			return JSON.decode(Cookie.read(self.key));
		}) || {};
	},

	setState: function(element, state){
		this.parent(element, state);
		Cookie.write(this.key, JSON.encode(this.state), {duration: 30});
		return this;
	}

});

})();


/*
---

name: Collapse.LocalStorage

description: Automatically saves the collapsed/expanded state to localStorage.

authors: Sean McArthur (@seanmonstar)

license: MIT-style license.

requires: [Core/JSON, Collapse.Persistent]

provides: Collapse.LocalStorage

...
*/

(function(){

this.Collapse.LocalStorage = new Class({

	Extends: this.Collapse.Persistent,

	getState: function(){
		var self = this;
		return Function.attempt(function(){
			return JSON.decode(localStorage.getItem(self.key));
		}) || {};
	},

	setState: function(element, state){
		this.parent(element, state)
		localStorage.setItem(this.key, JSON.encode(this.state));
		return this;
	}

});

})();


/*
---

name: ScrollLoader

description: Provides the ability to load more content when a user reaches the end of a page.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Events, Core/Options, Core/Element.Event, Core/Element.Dimensions, Class-Extras/Class.Binds]

provides: ScrollLoader

...
*/

(function(){

this.ScrollLoader = new Class({

	Implements: [Options, Events, Class.Binds],

	options: {
		/*onScroll: fn,*/
		area: 50,
		mode: 'vertical',
		container: null
	},

	initialize: function(options){
		this.setOptions(options);

		this.element = document.id(this.options.container) || window;
		this.attach();
	},

	attach: function(){
		this.element.addEvent('scroll', this.bound('scroll'));
		return this;
	},

	detach: function(){
		this.element.removeEvent('scroll', this.bound('scroll'));
		return this;
	},

	scroll: function(){
		var z = (this.options.mode == 'vertical') ? 'y' : 'x';

		var element = this.element,
			size = element.getSize()[z],
			scroll = element.getScroll()[z],
			scrollSize = element.getScrollSize()[z];

		if (scroll + size < scrollSize - this.options.area) return;

		this.fireEvent('scroll');
	}

});

}).call(this);


/*
---

name: Interface

description: Interfaces for Class to ensure certain properties are defined.

authors: Christoph Pojer (@cpojer), Luis Merino (@Rendez)

license: MIT-style license.

requires: [Core/Type, Core/Class]

provides: Interface

...
*/

(function(context){

this.Interface = new Type('Interface', function(object){
	if (object.Implements){
		Array.from(object.Implements).each(function(item){
			Object.append(this, item);
		}, this);

		delete object.Implements;
	}

	return Object.append(this, object);
});

Class.Mutators.initialize = function(fn){
	return this.prototype.Interface ? function(){
		var result = fn.apply(this, arguments);

		if (!this.Interface) return result;

		var interfaces = Array.from(this.Interface);
		for (var i = 0; i < interfaces.length; i++){
			var iface = interfaces[i];
			for (var key in iface){
				if (key.charAt(0) == '$') continue; // Skip Internal

				if (!(key in this)) throw new Error('Instance does not implement "' + key + '"');

				var item = this[key],
					object = iface[key];

				if (object == null) continue;

				var type = typeOf(item),
					oType = typeOf(object);

				// Needs to be same datatype OR instance of the provided object
				if (type != oType && !instanceOf(item, object)){
					var proto = object.prototype,
						name = (proto && proto.$family) ? proto.$family().capitalize() : object.displayName;
					throw new Error('Property "' + key + '" is implemented but not an instance of ' + (name ? '"' + name + '"' : 'the expected type'));
				}

				if (oType == 'function' && item.$origin.length < object.length)
					throw new Error('Property "' + key + '" does not implement at least ' + object.length + ' parameter' + (object.length != 1 ? 's' : ''));
			}
		}

		return result;
	} : fn;
};

}).call(typeof exports != 'undefined' ? exports : this);

