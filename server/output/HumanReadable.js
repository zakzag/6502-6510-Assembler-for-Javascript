/**
 * Output class for rendering output as a human readable compiled source code. 
 * 
 * @class HumanreadableOutputClass   
 * @requires {Util}
 * @requires {Output}
 */

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
	 * 
	 * @param {number} num          Number to parse.
	 * @param {number} length       Length of the output string.
	 * @returns {string}  string    Fixed width string (16 maximum).
	 */
	function fixedWidthNum(num, length) {
		var numStr = num.toString();
		return zeroStr.substring(0, length - numStr.length) + num;
	}
	
	/**
	 * Converts a byte number into its hexadecimal representation.
	 * Always returns 2 byte long string
	 * 
	 * @param {number} num   Number to convert.
	 * @returns {String}
	 */
	function byteHex(num) {
		return "$" + fixedWidthNum(num.toString(16), 2);
	}
	
	/**
	 * Converts a word number into its hexadecimal representation.
	 * Always returns 4 byte long string.
	 * 
	 * @param {type} num   Number to convert.
	 * @returns {String}
	 */
	function wordHex(num) {
		return "$" + fixedWidthNum(num.toString(16), 4);
	}
	
	/**
	 * Parses an opcode argument and returns the readable string
	 * example:
	 * $a5 $a0 should be translated as LDX #$a0
	 *         this function gets the addressing mode "name"
	 *         which is "IMM" (immediate value) and the argument
	 *         which is byte 165
	 *         Using a template (this.addressingModeTemplates)
	 *         it translates these arguments as "LDX #$a0"
	 * 
	 * @private
	 * @param {type} name                template name of the addressing mode (@see addressingModeTemplates)
	 * @param {string|number} arg        opcode argument (string,number)
	 * @returns {string}                 
	 */
	function parseTemplate(name, arg) {
		return addressingModeTemplates[name].replace("{arg}", arg);
	}

	/**
	 * Converts a string to a fixed width string aligned to left.
	 * Used for hexa numbers.
	 * 
	 * @private
	 * @param {string} str    String to append
	 * @param {type} length   Length of the result
	 * @returns {String}      Left aligned string.
	 */
	function fixedWidthLeft(str, length) {
		return str + spaceStr.substring(0, length - str.length);
	}
	/**
	 * Converts a string to a fixed width string aligned to left.
	 * Used for hexa numbers.
	 * 
	 * @private
	 * @param {string} str    String to append
	 * @param {type} length   Length of the result
	 * @returns {String}      Left aligned string.
	 */
	function fixedWidthRight(str, length) {
		return spaceStr.substring(0, length - str.length) + str;
	}
	
	/** 
	 * @class HumanreadableOutputClass   
	 */
	var HumanreadableOutputClass = Util.extend(Output, {
		/**
		 * @constructor Creates a new HumanreadableOutputClass object
		 * 
		 * @param {Compiler} compiler      Reference to the compiler. Must be set.
		 * @returns {undefined}
		 */
		constructor: function(compiler) {
			HumanreadableOutputClass.superclass.constructor.call(this, 'Raw', compiler);
		},
		
		/**
		 * Parses the compiled code into the desired output format.
		 * 
		 * @param {object} data     Data to convert.
		 * @param {string} output   Not used.
		 * @returns {String}      Output string
		 */
		parse: function(data, output) {
			var i, len, lineData, fnName;
			this.output = "";
			for (i = 0, len = data.length; i < len; i++) {
				lineData = data[i];

				fnName = "parse" + lineData.type;
				typeof this[fnName] === "function" && this[fnName].call(this, lineData);
			}
			
			return this.output;
		},
		
		/**
		 * Parses an opcode.
		 * 
		 * @param {object} lineData    Metadata of a compiled line.
		 * @returns {undefined}
		 */
		parseOpcode: function(lineData) {
			var bytes = lineData.opcodeData.data,
				opcode = lineData.opcodeData.opcode,

				lineStr = wordHex(lineData.pc),
				argStr = "",
				i, len;
		
			for (i = 0, len = bytes.length; i< len; i++) {
				argStr += " " + byteHex(bytes[i]);
			}
			
			lineStr += fixedWidthLeft(argStr,14) + opcode + " " +
					parseTemplate(lineData.opcodeData.addressingMode, "$" + lineData.opcodeData.originalArgValue.toString(16));

			this.output += lineStr +"\n";
		},
		
		/**
		 * Parses program counter type line.
		 * 
		 * @param {object} lineData     Metadata of a compiled line.
		 * @returns {undefined}
		 */
		parsePC: function(lineData) {
			this.output  += "*= " + wordHex(lineData.pcData.address) + "\n";
		},

		/**
		 * Parses a Directive line.
		 * 
		 * @param {object} lineData     Metadata of a compiled line.
		 * @returns {undefined}
		 */
		parseDirective: function(lineData) {
			var directiveName = lineData.directiveData.type,
				directive = this.compiler.getDirective(directiveName),
				fnName = "parse" + directiveName.charAt(0).toUpperCase() + directiveName.slice(1).toLowerCase() + "Directive",
				lineStr;
			
			directive && this[fnName] && (lineStr = this[fnName](lineData.directiveData));
			
			this.output += wordHex(lineData.pc) + " " + lineStr + "\n";
		},
				
		// @TODO: maybe separate different kind of directives is not a best solution
		//        line data should be in the same format in every type of directives
		/**
		 * Parses byte directive.
		 * 
		 * @private
		 * @param {array} line
		 * @returns {String}
		 */
		parseByteDirective: function(line) {
			var items = [];
			
			line.data.forEach(function(item) {
				items.push("$" + fixedWidthNum(item.toString(16),2));
			});
			return items.join(", ");
			
		},
		
		/**
		 * Parses text directive.
		 * 
		 * @private
		 * @param {array} line
		 * @returns {String}
		 */
		parseTextDirective: function(line) {
			return this.parseByteDirective(line);
		},
		
		/**
		 * Parses word directive.
		 * 
		 * @private
		 * @param {array} line
		 * @returns {String}
		 */
		parseWordDirective: function(line) {
			var items = [];
			
			line.data.forEach(function(item) {
				// push hi and lo bytes separatedly
				items.push(byteHex(item & 0xff));
				items.push(byteHex((item & 0xff00) >>> 8));
			});
			return items.join(", ");
		},
	});
	
	return HumanreadableOutputClass;
}());