/**
 * Output class for rendering JSON output from source.
 * This class returns a string containing an array of bytes.
 * 
 * @class JsonOutputClass   
 * 
 * @requires {Util}
 * @requires {Output}
 */

var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() { 
	"use strict";
	var JsonOutputClass = Util.extend(Output, {
		/**
		 * @constructor Creates a new JSON object
		 * 
		 * @param {Compiler} compiler      Reference to the compiler. Must be set.
		 * @returns {undefined}
		 */
		constructor: function(compiler) {
			JsonOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},
		/**
		 * Parses the compiled code into the desired output format.
		 * 
		 * @param {object} data     Data to convert.
		 * @param {string} output   Output string.
		 * @returns {String}      Output string
		 */
		parse: function(data, output) {
			return JSON.stringify(new Buffer(output.subarray(this.compiler.minAddress, this.compiler.maxAddress)).toJSON());
		}
	});
	
	return JsonOutputClass;
}());