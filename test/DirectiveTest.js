var assert = require("assert");
var Directive = require("../server/Directive");

suite("DirectiveClass", function() {
	var directive;
	
	setup(function() {
		directive = new Directive('unknown', null);
	});
	
	suite("constructor", function() {
		test("should create a new directive", function() {
			assert.equal('unknown', directive.name);
			assert.equal(null, directive.compiler);
		});
	});
	suite("setData", function() {
		test("should set data property", function() {
			var testData = { a: "something" };
			directive.setData(testData);
			
			assert.equal(testData, directive.data);
		});
	});
	
	suite("getLength", function() {
		test("should throw an error", function() {
			assert.throws(directive.getLength, Error);
		});
	});
	
	suite("validate", function() {
		test("should always return true ", function() {
			directive.setData("dfjasd");
			assert.equal(true, directive.validate());
		});
	});
	
	suite("parse", function() {
		test("should throw an error", function() {
			assert.throws(directive.parse, Error);
		});
	});
});