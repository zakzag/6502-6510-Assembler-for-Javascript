/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
ASM.Directive = (function() {
	return ASM.Util.extend(Object, {
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
		validate: function() {
			var matches = this.data.match(this.validRx);
			
			return matches !== null;
		},
		parse: function() {
			throw new Error("not implemented function: length for directive:" + this.name);
		}
	});
})();

ASM.directive = {};
ASM.directive.Text = ASM.Util.extend(ASM.Directive, {
	constructor: function(compiler) {
		ASM.directive.Text.superclass.constructor.call(this, 'Text', compiler);
	},
	rx: /^(?:"|')(.*)($1)$/i,
	parse: function() {
		this.validate();
		console.info("-------[directive text]-----------");
		var value = this.data.substring(1,this.data.length-1), 
			data= [];
		console.info("value", this.data, value);
		for (var i = 0, len = value.length; i < len; i++) {
			data.push(value.charCodeAt(i) & 0xff);
		}
		
		return {
			args: [value],
			length: data.length,
			data: data
		}
	}
});
ASM.directive.Byte = ASM.Util.extend(ASM.Directive, {});
ASM.directive.Word = ASM.Util.extend(ASM.Directive, {});