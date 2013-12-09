var Util = require("../Util");
var Directive = require("../Directive");

module.exports = (function() { 
	var TextDirectiveClass = Util.extend(Directive, {
		constructor: function(compiler) {
			TextDirectiveClass.superclass.constructor.call(this, 'Text', compiler);
		},
		rx: /^(?:"|')(.*)($1)$/i,
		parse: function() {
			this.validate();
			var value = this.data.substring(1,this.data.length-1), 
				data= [];
			for (var i = 0, len = value.length; i < len; i++) {
				data.push(value.charCodeAt(i) & 0xff);
			}

			return {
				args: [value],
				length: data.length,
				data: data
			}
		}
	});
	
	return TextDirectiveClass;
})();