/**
 * Connector for node.js
 */
var Util = require("./js/Util");
var Compiler = require("./js/Compiler");
var assembler = require("./js/Assembler");

assembler.init({
	inputFile: process.argv[2],
	outputFile: process.argv[3],
	outputMode: process.argv[4],
	scope: this,
	callback: function() {
		console.info(assembler.compile());
	}
});