ASM.directive.Byte = ASM.Util.extend(ASM.Directive, {
	constructor: function() {
		ASM.directive.Text.superclass.constructor.call(this, 'Byte', compiler);
	},
	rx: /^.*$/i,
	parse: function() {
		this.validate();
		
		
		
	}
});