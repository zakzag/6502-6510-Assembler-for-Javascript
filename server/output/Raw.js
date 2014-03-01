/**
 * Output class for rendering byte code
 * This class returns an Int8Array
 * 
 * @class RawOutputClass   
 */

var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() {
	"use strict";
	var RawOutputClass = Util.extend(Output, {
		/**
		 * @constructor Creates a new ProgramOutputClass object
		 * 
		 * @param {Compiler} compiler      Reference to the compiler. Must be set.
		 * @returns {undefined}
		 */
		constructor: function(compiler) {
			RawOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},
		
		/**
		 * Parses the compiled code into the desired output format.
		 * 
		 * @param {object} data     Data to convert.
		 * @param {string} output   Output string.
		 * @returns {String}      Output string
		 */
		parse: function(data, output) {
			return output.subarray(this.compiler.minAddress, this.compiler.maxAddress);
		}
	});
	
	return RawOutputClass;
})();