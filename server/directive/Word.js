/**
 * 
 * @type WordDirectiveClass    parses .word directive
 */

var Util = require("../Util");
var Directive = require("../Directive");

module.exports = (function() { 
	var WordDirectiveClass = Util.extend(Directive, {
		constructor: function(compiler) {
			WordDirectiveClass.superclass.constructor.call(this, 'Word', compiler);
		},
		rx: /^.*$/i,
		
		getLength: function() {
			return this.data.split(this.splitterRx).length * 2;
		},
		
		parse: function() {
			var items = this.data.split(this.splitterRx),
				evaldItems = [];

			this.validate();		

			items.forEach(function(item, index, all) {
				var itemData = this.compiler.evalExpression(item);
				if (itemData.value !== (itemData.value & 0xffff)) {
					console.info("length > 16bit in word directive");
				}
				itemData.value = itemData.value & 0xffff;

				evaldItems.push(itemData.value);
			}, this);

			return {
				type: "word",
				args: items,
				length: evaldItems.length,
				data: evaldItems
			}
		}
	});
	
	return WordDirectiveClass;
})();