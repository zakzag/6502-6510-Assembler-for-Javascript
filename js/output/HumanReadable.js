var Util = require("../Util");
var Output = require("../Output");
module.exports = (function() {
	"use strict";
	var zeroStr = "0000000000000",
		spaceStr = "                                        ",
		addressingModeTemplates = {
			"IMM": "#{arg}", 
			"ZP": "{arg}", 
			"ZPX": "{arg},X", 
			"ZPY": "{arg},Y", 
			"ABS": "{arg}", 
			"ABSX": "{arg},X", 
			"ABXY": "{arg},Y", 
			"INDX": "({arg}),Y", 
			"INDY": "({arg},X)", 
			"IMP": "", 
			"REL": "{arg}", 
			"IND": "({arg})"
		};
	
	function fixedWidthNum(num, length) {
		var numStr = new String(num);
		return zeroStr.substring(0, length - numStr.length) + num;
	}
	
	function parseTemplate(name, arg) {
		return addressingModeTemplates[name].replace("{arg}", arg);
	}

	function fixedWidthLeft(str, length) {
		return str + spaceStr.substring(0, length - str.length);
	}
	
	function fixedWidthRight(str, length) {
		return spaceStr.substring(0, length - str.length) + str;
	}
	
	var HumanreadableOutputClass = Util.extend(Output, {
		constructor: function() {
			HumanreadableOutputClass.superclass.constructor.call(this, 'Raw');
			this.output = "";
		},

		parse: function(data, output) {
			for (var i = 0, len = data.length; i < len; i++) {
				var lineData = data[i],
					fnName;
				fnName = "parse" + lineData.type;
				typeof this[fnName] === "function" && this[fnName].call(this, lineData);
			}
			
			return this.output;
		},

		parseOpcode: function(lineData) {
			var bytes = lineData.opcodeData.data,
				opcode = lineData.opcodeData.opcode,

				lineStr = fixedWidthNum(lineData.pc.toString(16),4),
				argStr = "";
		
			for (var i = 0, len = bytes.length; i< len; i++) {
				argStr += " " + fixedWidthNum(bytes[i].toString(16), 2);				
			}
			
			lineStr += fixedWidthLeft(argStr,10) + opcode + " " +
					parseTemplate(lineData.opcodeData.addressingMode, "$" + lineData.opcodeData.originalArgValue.toString(16));

			this.output += lineStr +"\n";
		},

		parseDirective: function(lineData) {
			//console.info(lineData.directiveData);
		}
	});
	
	return HumanreadableOutputClass;
})();