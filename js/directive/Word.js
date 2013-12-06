var Util = require("../Util");
var Directive = require("../Directive");

module.exports = (function() { 
	var WordClass = Util.extend(Directive, {
		constructor: function(compiler) {
			WordClass.Word.superclass.constructor.call(this, 'Word', compiler);
		},
		rx: /^.*$/i,
		parse: function() {
			var items = this.data.split(this.splitterRx),
				evaldItems = [];

			this.validate();		

			items.forEach(function(item, index, all) {
				var itemData = this.compiler.evalExpression(item);
				itemData.length = 2;
				if (itemData.value !== (itemData.value & 0xffff)) {
					console.info("length > 16bit in word directive");
				}
				itemData.value = itemData.value & 0xffff;

				evaldItems.push(itemData);
			}, this);

			return {
				args: items,
				length: evaldItems.length,
				data: evaldItems
			}
		}
	});
});