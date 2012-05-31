/*
file:   modules/notification/ui.js
author: @chielkunkels

Handles notifications
*/
log('modules/notification/ui.js');

var notifications = {

	// publish a new notification
	publish: function(type, message){
		log('modules/notification/ui.send(', type, ', ', message, ');');

		new Element('div.ntf.'+type, {
			text: message
		}).inject(document.body);
	}
};

module.exports = notifications;

