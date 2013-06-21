ASM.directive.Byte = ASM.Util.extend(ASM.Directive, {
	constructor: function(compiler) {
		console.info(compiler);
		ASM.directive.Byte.superclass.constructor.call(this, 'Byte', compiler);
	},
	rx: /^.*$/i,
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
			args: items,
			length: evaldItems.length,
			data: evaldItems
		}
	}
});