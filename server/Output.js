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
		 * @field {CompilerClass} compiler     reference to the containing compiler
		 */
		compiler: null,
		/**
		 * @field {string} name                name of this Output class
		 */
		name: undefined,
		constructor: function(name, compiler) {
			this.name = name;
			this.compiler = compiler;
		}
	});
})();