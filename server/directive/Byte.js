
var Util = require("../Util");
var Directive = require("../Directive");

module.exports = (function() { 
	var ByteClass = Util.extend(Directive, {
		constructor: function(compiler) {
			ByteClass.superclass.constructor.call(this, 'Byte', compiler);
		},
		rx: /^.*$/i,
		
		getLength: function() {
			return this.data.split(this.splitterRx).length;
		},
		
		parse: function() {
			var items = this.data.split(this.splitterRx),
				evaldItems = [];

			this.validate();

			items.forEach(function(item, index, all) {
				var itemData = this.compiler.evalExpression(item);
				itemData.length = 1;
				if (itemData.value !== (itemData.value & 0xff)) {
					console.info("length > 8bit in byte directive");
				}
				itemData.value = itemData.value & 0xff;

				evaldItems.push(itemData.value);
			}, this);

			return {
				type: "byte",
				args: items,
				length: evaldItems.length,
				data: evaldItems
			}
		}
	});
	
	return ByteClass;
})();