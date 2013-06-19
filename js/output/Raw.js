ASM.output.Raw = ASM.Util.extend(ASM.Output, {
	constructor: function() {
		ASM.output.Raw.superclass.constructor.call(this, 'Raw');
	},
			
	parse: function(data, output) {
		return output;
	}
});