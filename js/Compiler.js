/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
ASM.Compiler = (function() {
	var RX_DECIMAL = /[0-9]/i,
		RX_HEXA = /\$[0-9a-fA-F]{1,4}/i,
		RX_BINARY = /%[01]{1,16}/i,
		RX_COMMENT = /;.*/,
		RX_LABEL = /[a-zA-Z_][a-zA-Z0-9]*:/i,
		RX_LABEL_DEF = /[a-zA-Z_][a-zA-Z0-9]*\s*=\s*/i,
		RX_OPCODE = /[a-zA-Z]{3}/i,
		RX_DIRECTIVE = /\.\w+/i,
		RX_EXPRESSION_SPLITTER = /[+\-*]/i,
		RX_LINESPLITTER = /^\s*([^:]*?:)*\s*([a-zA-Z_][a-zA-Z0-9]*\s*=|\w{1,4}|\.\w+|\*\s*=){0,1}\s*([^;\s]*)*\s*(;.*)*$/i;

		DIRECTIVES = {
			byte: {
				name: "byte",
				rx: /^[^,]*(,[^,]+)*$/gi,
				fn: function(str) {
					if (!str.match(rx)) {
						throw new Error("Invalid byte directive");
					}

					//
				}
			},
			word: {
				name: "word",

			}
		}

	return Util.extend(Object, {
		constructor: function(config) {
			this.init(config);
		},

		pc: undefined,

		init: function(config) {
			this.config = config;

			this.lines = [];
			this.labels = {};
			this.defaultStart = config.defaultStart || 0x1000;
			this.scope = config.scope || this;
			this.messagesCb = config.messagesCb || function() {};
			this.opcodes = config.opcodes || ASM.Opcode;
		},

		compile: function(text) {
			this.lines = text.split("\n");
			this.pc = this.defaultStart;
			this.data = [];

			this.pass1();
			this.pass2();
		},

		// pass #1 collecting labels
		pass1: function() {
			for (var i = 0, len = this.lines.length; i < len; i++) {
				var parts = this.evalLine(this.lines[i], i),
					data = {
						line: this.lines[i],
						pc: undefined,
						parts: parts
					}

				this.data[i] = data;

				if (typeof parts.label != "undefined") {
					var labelName = parts.label;

					if (this.labels[labelName]) {
						throw new Error("Duplicate label: ", labelName, "");
					}

					this.labels[labelName] = { line: i, length: 2 }   // all the program labels have 2bytes  length
				}
			}

			console.info(this.labels);
		},

		// collection constants
		pass2: function() {
			for (var i = 0, len = this.data.length; i < len; i++) {
				console.info(i);
			}
		},

		evalLine: function(line, num) {
			var parts = RX_LINESPLITTER.exec(line);
			if (!parts) {
				this.log("syntax error at line #"+ num);
				throw new Error("syntax error at " + num);
			}

			return {
				label: parts[1],
				opcode: parts[2],
				args: parts[3],
				comment: parts[4]
			}
		},

		getAddressingMode: function(expression) {

		},

		evalExpression: function(expression) {

		},

		log: function() {
			var fn = this.messagesCb ? this.messagesCb.bind(this.scope) : console.info;
			for (var i= 0, len = arguments.length; i < len; i++ ) {
				fn(arguments[i]);
			}
		}
	});
})();
