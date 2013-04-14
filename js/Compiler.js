/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {
	var RX_DECIMAL = "[0-9]",
		RX_HEXA = "\$[0-9a-fA-F]{1,4}",
		RX_BINARY = "%[01]{1,16}",
		RX_COMMENT = ";.*",
		RX_LABEL = "[a-zA-Z_][a-zA-Z0-9]*:",
		RX_OPCODE = "",
		RX_DIRECTIVE = "";

		DIRECTIVES = {
			str: {
				name: "string",
				token: "str",
				rx: "\"[^\"]\"",
				fn: function(str) {
					var rx = DIRECTIVES.str.rx;

					

					return {
						bytes: 1,
						length: 1
					}
				}
			},

		}

	ASM.Compiler = function(config) {
		this.init(config);
	};

	ASM.Compiler.prototype = {
		constructor: ASM.Compiler,

		init: function(config) {
			this.config = config;
		},

		compile: function(text) {
			console.info("");
		}
	}
})()
