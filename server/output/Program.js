var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() { 
	var ProgramOutputClass = Util.extend(Output, {
		constructor: function(compiler) {
			ProgramOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},

		parse: function(data, output) {
			var addressBuffer = new Buffer(2);
			addressBuffer.writeUInt16LE(this.compiler.minAddress, 0);
			var dataBuffer = new Buffer(output.subarray(this.compiler.minAddress, this.compiler.maxAddress));
			
			return Buffer.concat([addressBuffer, dataBuffer]);
		}
	});
	
	return ProgramOutputClass;
})();