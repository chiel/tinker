/*
slides.js

author: @chielkunkels
*/'use strict';
// log('slides.js');

var slides = new Class({

	_locked: false,
	morphOptions: {
		duration: 200,
		transition: Fx.Transitions.Quad.easeInOut
	},
	slides: [],
	curSlide: 0,

	initialize: function(wrapper){
		log('slides.initialize();');

		if (!wrapper) {
			wrapper = new Element('div.sld');
			this.slides = new Elements();
		} else {
			this.slides = wrapper.getElements('section');
			this.slides.setStyle('display', 'none');
			if (this.slides[0]) {
				this.slides[0].setStyle('display', 'block');
			}
		}

		this.wrapper = wrapper;

		if (this.slides.length) {
			this.slides.set('morph', this.morphOptions);
			this.wrapper.getElements('.sld-prev').addEvent('click', function(e) {
				e.preventDefault();

				this.previous();
			}.bind(this));

			this.wrapper.getElements('.sld-next').addEvent('click', function(e) {
				e.preventDefault();

				this.next();
			}.bind(this));
		}
	},

	// show a slide, by index
	show: function(index){

		if (this._locked || !this.slides[index]) {
			return;
		}

		this.locked = true;

		if (!this.slideDimensions) {
			this.slideDimensions = this.wrapper.getSize();
		}

		var anim = {
			cur: [0, -this.slideDimensions.x],
			next: [this.slideDimensions.x, 0]
		};

		if (index < this.curSlide) {
			anim = {
				cur: [0, this.slideDimensions.x],
				next: [-this.slideDimensions.x, 0]
			};
		}

		this.wrapper.setStyle('overflow', 'hidden');
		this.slides[this.curSlide].setStyles({
			position: 'absolute',
			top: 0,
			left: anim.cur[0]
		}).morph({left: anim.cur[1]}).get('morph').chain(function(){
			this.slides[this.curSlide].setStyle('display', 'none');
			this._locked = false;
			this.curSlide = index;
		}.bind(this));

		this.slides[index].setStyles({
			position: 'absolute',
			top: 0,
			left: anim.next[0],
			display: 'block'
		}).morph({left: anim.next[1]});
	},

	// go to the next slide
	next: function(){
		this.show(this.curSlide + 1);
	},

	// go to the previous slide
	previous: function(){
		this.show(this.curSlide - 1);
	}

});

module.exports = slides;

