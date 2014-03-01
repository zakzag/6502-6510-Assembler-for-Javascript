/*
 * Directives directs assembler to do specific functions.
 * So far, .text, .word and .byte directives was implemented
 * 
 * @class Directive    Base class for directives, not used directly.
 * @requires Util
 */
var Util = require("./Util");

module.exports = (function() {
	return Util.extend(Object, {
		/**
		 * @constructor Creates a new Directive
		 *  
		 * @param {string}   name       Name of the directive.
		 * @param {Compiler} compiler   Reference to the compiler used.
		 * @returns {undefined}
		 */
		constructor: function constructor(name, compiler) {
			this.name = name;            // name of the directive
			this.result = undefined;
			this.compiler = compiler;    // reference to compiler ?refactor?
		},
		/**
		 * @type {RegExp}
		 * @public
		 */
		validRx: /^.*$/i,
		/**
		 * @type {RegExp}
		 * @public
		 */
		splitterRx: /,/i,
		/**
		 * Stores data for directive. 
		 * 
		 * @param {type} data
		 * @returns {undefined}
		 */
		setData: function setData(data) {
			this.data = data;
		},
		
		/**
		 * In inherited classes this method returns the length of the compiled 
		 * code by the directive.
		 * 
		 * @public
		 * @abstract
		 * @throws {Error}
		 * @returns {undefined}
		 */
		getLength: function getLength() {
			throw new Error("Abstract function called: getLength");
		},
		
		/**
		 * Validates data passed by setData method, using validRx
		 * regular expression. 
		 * 
		 * @public
		 * @returns {Boolean}  true if data was valid.
		 */
		validate: function validate() {
			var matches = this.data.match(this.validRx);
			
			return matches !== null;
		},
		
		/**
		 * In inherited classes it parses the passed data to bytecode.
		 * 
		 * @public
		 * @abstract
		 * @throws {Error}
		 * @returns {undefined}
		 */
		parse: function parse() {
			throw new Error("not implemented function: parse   for directive:" + this.name);
		}
	});
})();