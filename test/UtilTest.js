var assert = require("assert");
var Util = require("../server/Util");

describe('UtilClass', function(){
	describe('apply', function(){
		it('should merge items together', function() {
			var extendee = {
				a: 1,
				b: 2
			}
			
			var extender = {
				b: 1,
				c: 3,
				d: 4
			}
			
			var defaults = {
				a:2,
				c:4,
				e:5
			}
			
			var result = Util.apply(extendee, extender, defaults);
			assert.equal(5, result.e);
			assert.equal(3, result.c);
			assert.equal(1, result.b);
			assert.equal(2, result.a);
		});
		
		it('should extend a class and create a new one', function() {
			
		})
	})
})
