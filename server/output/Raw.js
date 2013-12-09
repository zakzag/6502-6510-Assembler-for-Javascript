var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() { 
	var RawOutputClass = Util.extend(Output, {
		constructor: function() {
			RawOutputClass.superclass.constructor.call(this, 'Raw');
		},

		parse: function(data, output) {
			return output;
		}
	});
	
	return RawOutputClass;
})();