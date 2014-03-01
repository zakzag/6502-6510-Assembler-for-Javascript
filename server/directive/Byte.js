/**
 * Parses
 * 
 * @class ByteDirectiveClass   
 * 
 * @requires {Util} 
 * @requires {Directive}
 */
var Util = require("../Util");
var Directive = require("../Directive");

module.exports = (function() { 
	"use strict";
	var ByteDirectiveClass = Util.extend(Directive, {
		/**
		 * Creates a new ByteDirectiveClass. Calls parent constructor.
		 * 
		 * @constructor
		 * @param {type} compiler
		 * @returns {undefined}
		 */
		constructor: function(compiler) {
			ByteDirectiveClass.superclass.constructor.call(this, 'Byte', compiler);
		},
		/**
		 * Regular expression for validating directive
		 * 
		 * @type {RegExp}
		 * @public
		 */
		validRx: /^.*$/i,
		
		/**
		 * Returns the number of the bytes in the current directive.
		 * 
		 * @returns {number}
		 */
		getLength: function() {
			return this.data.split(this.splitterRx).length;
		},
		
		/**
		 * Parses byte directive by evaluating each item.
		 * @returns {object}   Metadata of the directive
		 */
		parse: function() {
			var items = this.data.split(this.splitterRx),
				evaldItems = [];

			this.validate();

			items.forEach(function(item, index, all) {
				var itemData = this.compiler.evalExpression(item);
				
				// byte is always 1 byte long.
				itemData.length = 1;
				if (itemData.value !== (itemData.value & 0xff)) {
					// @TODO: .log!!!
					console.info("length > 8bit in byte directive");
				}
				itemData.value = itemData.value & 0xff;

				evaldItems.push(itemData.value);
			}, this);

			return {
				/**
				 * data type: byte
				 * @type {string}
				 */
				type: "byte",
				/**
				 * list of the unevaluated items in the directive. Each item
				 * is a string.
				 * @type {array<string>}
				 */
				args: items,
				/**
				 * Number of the evaluated bytes
				 * @type {number}
				 */
				length: evaldItems.length,
				/**
				 * list of the evaluated items in the directive. All
				 * identifier is resolved, each item contains a byte.
				 * @type {array<string>}
				 */
				data: evaldItems
			};
		}
	});
	
	return ByteDirectiveClass;
}());