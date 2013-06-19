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