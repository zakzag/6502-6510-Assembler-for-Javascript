/**
 * Parses .word directive.
 * 
 * @class WordDirectiveClass    
 * 
 * @requires {Util}
 * @requires {Directive}
 */

var Util = require("../Util");
var Directive = require("../Directive");

module.exports = (function() { 
	var WordDirectiveClass = Util.extend(Directive, {
		/**
		 * Creates a new Word directive
		 * 
		 * @param {Compiler} compiler   Reference to the compiler.
		 * 
		 * @returns {undefined}
		 */
		constructor: function(compiler) {
			WordDirectiveClass.superclass.constructor.call(this, 'Word', compiler);
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
			return this.data.split(this.splitterRx).length * 2;
		},
		
		/**
		 * Parses word directive by evaluating each item.
		 * @returns {object}   Metadata of the directive
		 */
		parse: function() {
			var items = this.data.split(this.splitterRx),
				itemData,
				evaldItems = [];

			this.validate();		

			items.forEach(function(item, index, all) {
				itemData = this.compiler.evalExpression(item);
				
				if (itemData.value !== (itemData.value & 0xffff)) {
					console.info("length > 16bit in word directive");
				}
				itemData.value = itemData.value & 0xffff;

				evaldItems.push(itemData.value);
			}, this);

			return {
				/**
				 * data type: word
				 * @type {string}
				 */
				type: "word",
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
				 * identifier is resolved, each item contains a word.
				 * @type {array<string>}
				 */
				data: evaldItems
			};
		}
	});
	
	return WordDirectiveClass;
}());