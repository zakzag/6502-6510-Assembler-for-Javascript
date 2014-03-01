/**
 * Parses .text directives into byte code.
 * 
 * @class TextDirectiveClass
 */

var Util = require("../Util");
var Directive = require("../Directive");

module.exports = (function() { 
	"use strict";
	var TextDirectiveClass = Util.extend(Directive, {
		/**
		 * Creates a new ByteDirectiveClass. Calls parent constructor.
		 * 
		 * @constructor
		 * @param {type} compiler
		 * @returns {undefined}
		 */
		constructor: function(compiler) {
			TextDirectiveClass.superclass.constructor.call(this, 'Text', compiler);
		},
		/**
		 * Regular expression for validating directive
		 * 
		 * @type {RegExp}
		 * @public
		 */
		validRx: /^(?:"|')(.*)($1)$/i,
		/**
		 * Returns the number of the bytes in the current directive.
		 * 
		 * @returns {number}
		 */
		getLength: function() {
			return this.data.length - 2;
		},
		/**
		 * Parses Text directive.
		 * @returns {object}   Metadata of the directive
		 */
		parse: function() {
			var value, data = [], i, len;
			
			this.validate();
			
			value = this.data.substring(1,this.data.length-1);
		
			for (i = 0, len = value.length; i < len; i++) {
				data.push(value.charCodeAt(i) & 0xff);
			}

			return {
				/**
				 * data type: text
				 * @type {string}
				 */
				type: "text",
				/**
				 * Arguments of the directive. In this case, this is always a
				 * string.
				 * @type {array}
				 */
				args: [value],
				/**
				 * Number of the evaluated bytes
				 * @type {number}
				 */
				length: data.length,
				/**
				 * list of the evaluated items in the directive. All
				 * identifier is resolved, each item contains a byte.
				 * @type {array<string>}
				 */
				data: data
			};
		}
	});
	
	return TextDirectiveClass;
}());