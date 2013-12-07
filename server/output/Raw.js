var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() { 
	var RawOutputClass = Util.extend(Output, {
		constructor: function() {
			ASM.output.Raw.superclass.constructor.call(this, 'Raw');
		},

		parse: function(data, output) {
			return output;
		}
	});
	
	return RawOutputClass;
});