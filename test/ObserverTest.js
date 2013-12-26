var assert = require("assert");
var Observer = require("../server/Observer");

suite("ObserverClass", function() {
	var observer;
	var eventName = "testEvent";
	
	setup(function() {
		observer = new Observer();
	});
	
	suite("constructor", function() {
		test("should create an empty event array", function() {
			assert.deepEqual(observer.events, {});
		});
	});
	
	suite("on", function() {
		test("should bind one event to the object", function() {
			var eventHandler = function() { };
			
			observer.on(eventName, eventHandler);
			assert.notEqual(observer.events[eventName], undefined);
		});
	});
	
	suite("un", function() {
		test("should remove event handler from the object", function() {
			var eventHandler = function() { };
			
			observer.on(eventName, eventHandler);
			observer.un(eventName, eventHandler);	
			assert.deepEqual(observer.events[eventName], {});
		});
		
		test("should remove the selected event only", function() {
			var eventHandler1 = function() { };
			var eventHandler2 = function() { };
			
			observer.on(eventName, eventHandler1);
			observer.on(eventName, eventHandler2);
			
			observer.un(eventName, eventHandler1);	
			assert.deepEqual(observer.events[eventName], eventHandler2);
		});
	});
});