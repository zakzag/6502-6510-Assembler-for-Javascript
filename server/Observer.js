/**
 * @class ObserverClass     Simple class that implements Observer pattern.
 */

var Util = require("./Util");

module.exports = (function() {
	"use srtict";
	var ObserverClass = Util.extend(Object, {
		/**
		 * @constructor Initializes the class by emptying events. Chainable.
		 * @returns {object}     Returns self to make constructor chainable.
		 */
		constructor: function() {
			this.events = {};
			return this;
		},
		/**
		 * Events bound to this object, indexed by name.
		 * @type {object} 
		 * @public
		 */
		events: null,
		/**
		 * Subscribes an event handler for the given event. Chainable.
		 * 
		 * @param {string} eventName   Name of the event.
		 * @param {function} fn        Event handler function.
		 * @param {object} scope       Scope when event handler gets called.
		 * @returns {object}           Returns self to make function chainable.
		 */
		on: function(eventName, fn, scope) {
			if(!this.events[eventName]) {
				this.events[eventName] = [];
			}
			this.events[eventName].push({
				fn: fn,
				scope: scope
			});
			
			return this;
		},
		/**
		 * Unsubscribes event handler from the given event. Chainable.
		 * 
		 * @public
		 * @param {string} eventName      Event name.
		 * @param {function} fn           Function to be called when event was triggered.
		 * @returns {object}              Returns self to make function chainable.
		 */
		un: function(eventName, fn) {
			var eventSubscribers = this.events[eventName];
			
			eventSubscribers.forEach(function(item, index, all) {
				item.fn === fn && delete all[index];
			}, this);
			
			return this;
		},
		/**
		 * Fires an event, sends data as param of the eventhandler.
		 * 
		 * @public
		 * @param {string} eventName        Event name.
		 * @param {mixed} data              Any data (primitives, objects).
		 * @returns {object}                Returns self to make function chainable.
		 */
		fire: function(eventName, data) {
			var eventSubscribers = this.events[eventName];
			
			// only fire event, when there are event handlers
			eventSubscribers && eventSubscribers.forEach(function(item, index, all) {
				item.fn.call(item.scope || this || window, data);
			}, this);
			
			return this;
		}
	});
	
	return ObserverClass;
})();