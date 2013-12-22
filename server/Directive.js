/*
 * Directives directs assembler to do specific functions.
 * So far, .text, .word and .byte directives was implemented
 * 
 * @class Directive / base class for directives
 */
var Util = require("./Util");

module.exports = (function() {
	return Util.extend(Object, {
		constructor: function(name, compiler) {
			this.name = name;            // name of the directive
			this.result = undefined;
			this.compiler = compiler;    // reference to compiler ?refactor?
		},
		validRx: /^.*$/i,
		splitterRx: /,/i,
		setData: function(data) {
			this.data = data;
		},
				
		getLength: function() {
			throw new Error("Abstract function called: getLength");
		},
		validate: function() {
			var matches = this.data.match(this.validRx);
			
			return matches !== null;
		},
		parse: function() {
			throw new Error("not implemented function: parse   for directive:" + this.name);
		}
	});
})();