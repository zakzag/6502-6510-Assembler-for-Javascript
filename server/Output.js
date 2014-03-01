/*
 * Directives directs assembler to do specific functions.
 * So far, .text, .word and .byte directives was implemented
 * 
 * @class ASM.Directive / base class for directives
 */
var Util = require("./Util");

module.exports = (function() {
	return Util.extend(Object, {
		/** 
		 * Reference to the containing compiler. A Required field.
		 * @public
		 * @type {CompilerClass} 
		 */
		compiler: null,
		
		/**
		 * Name of this Output class
		 * 
		 * @public
		 * @type {string} 
		 */
		name: undefined,
		
		/**
		 * @constructor  Creates a new output object.
		 * 
		 * @param {string}   name      Name of the output type.
		 * @param {Compiler} compiler  Reference to the compiler.
		 * 
		 * @returns {undefined}
		 */
		constructor: function(name, compiler) {
			this.name = name;
			this.compiler = compiler;
		}
	});
})();