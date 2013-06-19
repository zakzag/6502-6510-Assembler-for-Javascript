ASM.output.HumanReadable = (function() {
	var zeroStr = "00000000",
		spaceStr = "                                    ";
	
	function fixedWidthNum(num, length) {
		var numStr = new String(num);
		return zeroStr.substring(0, length - numStr.length) + num;
	}

	function fixedWidth(str, length) {
		return str + spaceStr.substring(0, length - str.length);
	}
	
	return ASM.Util.extend(ASM.Output, {
		constructor: function() {
			ASM.output.Raw.superclass.constructor.call(this, 'Raw');
			this.output = "";
		},

		parse: function(data, output) {
			for (var i = 0, len = data.length; i < len; i++) {
				var lineData = data[i],
					fnName;

				fnName = "parse" + lineData.type;
				console.info(fnName);
				typeof this[fnName] == "function" && this[fnName].call(lineData)
			}
			
			return this.output;
		},

		parseOpcode: function(lineData) {
			var bytes = lineData.opcodeData.data,
				opcode = lineData.opcodeData.opcode,

				lineStr = fixedWidthNum(lineData.pc.toString(16),4);
		
			for (var i = 0, len = bytes.length; i< len; i++) {
				lineStr += " " + fixedWidthNum(bytes[i], 2);				
			}
			
			lineStr += opcode;
			
			this.output += lineStr +"\n";
		},

		parseDirective: function(lineData) {

		}
	});
});