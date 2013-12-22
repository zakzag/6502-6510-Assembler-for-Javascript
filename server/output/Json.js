/**
 * 
 * @type JsonOutputClass   Output class for rendering JSON output from source
 * 
 * This class returns a string containing an array of bytes
 */

var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() { 
	var JsonOutputClass = Util.extend(Output, {
		constructor: function(compiler) {
			JsonOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},

		parse: function(data, output) {
			return JSON.stringify(new Buffer(output.subarray(this.compiler.minAddress, this.compiler.maxAddress)).toJSON());
		}
	});
	
	return JsonOutputClass;
})();