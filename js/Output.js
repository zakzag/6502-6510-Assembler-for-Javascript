/*
 * Directives directs assembler to do specific functions.
 * So far, .text, .word and .byte directives was implemented
 * 
 * @class ASM.Directive / base class for directives
 */
ASM.Output = (function() {
	return ASM.Util.extend(Object, {
		constructor: function(name, compiler) {
			this.name = name;            // name of the directive
			
		}
	});
});

ASM.output = {};