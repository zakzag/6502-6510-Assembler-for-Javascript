/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
ASM.Directive = (function() {
	return Util.extend(Object, {
		constructor: function(name) {
			this.name = name;
			this.rx = /^.*$/gi;
			this.result = undefined;
		},
		isValid: function() {
			this.result = str.match(this.rx);
			return this.result;
		},
		length: function() {
			throw new Error("not implemented function: length for directive:" + this.name);
		},
		get: function() {
			throw new Error("not implemented function: get for directive:" + this.name);
		}
	});
})();

ASM.directive = {};

ASM.directive.String = Util.extend(ASM.Directive, {
	rx: /s/
});
ASM.directive.Byte = Util.extend(ASM.Directive, {});
ASM.directive.Word = Util.extend(ASM.Directive, {});
ASM.directive.End = Util.extend(ASM.Directive, {});