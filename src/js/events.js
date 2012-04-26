/*
events.js

author: @chielkunkels
*/'use strict';
// log('events.js');

var events = new Events();

function publish(type, args, delay){
	events.fireEvent(type, args, delay);
}

function subscribe(type, fn, internal){
	events.addEvent(type, fn, internal);
}

module.exports = {
	publish: publish,
	subscribe: subscribe
};
