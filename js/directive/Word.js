
ASM.directive.Word = ASM.Util.extend(ASM.Directive, {
	constructor: function() {
		ASM.directive.Text.superclass.constructor.call(this, 'Word', compiler);
	},
});