/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
ASM.Compiler = (function() {
	var RX_DECIMAL = "[0-9]",
		RX_HEXA = "\$[0-9a-fA-F]{1,4}",
		RX_BINARY = "%[01]{1,16}",
		RX_COMMENT = ";.*",
		RX_LABEL = "[a-zA-Z_][a-zA-Z0-9]*:",
		RX_OPCODE = "[a-zA-Z]{3}",
		RX_DIRECTIVE = "";

		DIRECTIVES = {
			str: {
				name: "string",
				rx: /^\"(.*?)\"$/gi,
				fn: function(str) {
					var result = str.match(this.rx);

					if(result == null) {
						throw new Error("invalid string directive");
					} else {
						return Array((result[0].split("\""))[1]);
					}
				}
			},
			byte: {
				name: "byte",
				rx: /^[^,]*(,[^,]+)*$/gi,
				fn: function(str) {
					
				}
			}

		}

	Compiler = function(config) {
		this.init(config);

		console.info("ASM.Compiler", this);
		DIRECTIVES.str.fn("\"dfjauiefuer^!(&^!\"");
	};

	Compiler.prototype = {
		constructor: ASM.Compiler,

		init: function(config) {
			this.config = config;

			this.opcodes = config.opcodes;
		},

		compile: function(text) {
			console.info("compiling");
		}
	}

	return Compiler;
})();
