/**
 * Output class for rendering executable program
 * 
 * @Class ProgramOutputClass   
 * 
 * This class returns a Buffer containing an executable program for emulators
 * (and for C64 as well). 
 * The first 2 bytes are the start address of the program
 */

var Util = require("../Util");
var Output = require("../Output");

module.exports = (function() { 
	"use strict";
	var ProgramOutputClass = Util.extend(Output, {
		/**
		 * @constructor Creates a new ProgramOutputClass object
		 * 
		 * @param {Compiler} compiler      Reference to the compiler. Must be set.
		 * @returns {undefined}
		 */
		constructor: function(compiler) {
			ProgramOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},
		/**
		 * Parses the compiled code into the desired output format.
		 * 
		 * @param {object} data     Data to convert.
		 * @param {string} output   Output string.
		 * @returns {String}      Output string
		 */
		parse: function(data, output) {
			var addressBuffer = new Buffer(2);
			addressBuffer.writeUInt16LE(this.compiler.minAddress, 0);
			var dataBuffer = new Buffer(output.subarray(this.compiler.minAddress, this.compiler.maxAddress + 1));
			
			return Buffer.concat([addressBuffer, dataBuffer]);
		}
	});
	
	return ProgramOutputClass;
}());
