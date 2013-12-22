var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() { 
	var JsonOutputClass = Util.extend(Output, {
		constructor: function(compiler) {
			JsonOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},

		parse: function(data, output) {
			return new Buffer(output.subarray(this.compiler.minAddress, this.compiler.maxAddress)).toJSON();
		}
	});
	
	return JsonOutputClass;
})();