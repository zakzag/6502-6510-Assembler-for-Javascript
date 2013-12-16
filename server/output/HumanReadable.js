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
	
	/**
	 * Parses fixed width numeric value as a string.
	 * @param {type} num          number to parse
	 * @param {type} length       length of the output string
	 * @returns {string}  string  fixed width string (16 maximum)
	 */
	function fixedWidthNum(num, length) {
		var numStr = new String(num);
		return zeroStr.substring(0, length - numStr.length) + num;
	}
	
	function byteHex(num) {
		return "$" + fixedWidthNum(num.toString(16), 2);
	}
	
	function wordHex(num) {
		return "$" + fixedWidthNum(num.toString(16), 4);
	}
	
	/**
	 * parses an opcode argument and returns the readable string
	 * example:
	 * $a5 $a0 should be translated as LDX #$a0
	 *         this function gets the addressing mode "name"
	 *         which is "IMM" (immediate value) and the argument
	 *         which is byte 165
	 *         Using a template (this.addressingModeTemplates)
	 *         it translates these arguments as "LDX #$a0"
	 * 
	 * @param {type} name                template name of the addressing mode (@see addressingModeTemplates)
	 * @param {string|number} arg        opcode argument (string,number)
	 * @returns {string}                 
	 */
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
		constructor: function(compiler) {
			HumanreadableOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},

		parse: function(data, output) {
			this.output = "";
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

				lineStr = wordHex(lineData.pc),
				argStr = "";
		
			for (var i = 0, len = bytes.length; i< len; i++) {
				argStr += " " + byteHex(bytes[i]);
			}
			
			lineStr += fixedWidthLeft(argStr,14) + opcode + " " +
					parseTemplate(lineData.opcodeData.addressingMode, "$" + lineData.opcodeData.originalArgValue.toString(16));

			this.output += lineStr +"\n";
		},
				
		parsePC: function(lineData) {
			this.output  += "*= " + wordHex(lineData.pcData.address) + "\n";
		},

		parseDirective: function(lineData) {
			var directiveName = lineData.directiveData.type,
				directive = this.compiler.getDirective(directiveName),
				fnName = "parse" + directiveName.charAt(0).toUpperCase() + directiveName.slice(1).toLowerCase() + "Directive",
				lineStr;
			
			directive && this[fnName] && (lineStr = this[fnName](lineData.directiveData));
			
			this.output += wordHex(lineData.pc) + " " + lineStr + "\n";
		},
				
		// @TODO: maybe separate different kind of directives is not a best solution
		//        line data should be the same format in every type of directives
		parseByteDirective: function(line) {
			var items = []
			line.data.forEach(function(item) {
				items.push("$" + fixedWidthNum(item.toString(16),2));
			});
			return items.join(", ");
			
		},
		
		parseTextDirective: function(line) {
			return this.parseByteDirective(line);
		},
		
		parseWordDirective: function(line) {
			var items = []
			line.data.forEach(function(item) {
				// push hi and lo bytes separatedly
				items.push(byteHex(item & 0xff));
				items.push(byteHex((item & 0xff00) >>> 8));
			});
			return items.join(", ");
		},
	});
	
	return HumanreadableOutputClass;
})();