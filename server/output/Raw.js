/**
 * 
 * @type RawOutputClass   Output class for rendering byte code
 * 
 * This class returns an Int8Array
 */

var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() {
	var RawOutputClass = Util.extend(Output, {
		constructor: function(compiler) {
			RawOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},

		parse: function(data, output) {
			return output.subarray(this.compiler.minAddress, this.compiler.maxAddress);
		}
	});
	
	return RawOutputClass;
})();