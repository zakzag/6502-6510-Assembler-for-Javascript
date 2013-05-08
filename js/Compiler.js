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
		RX_EMPTYLINE = /^\s*$/i,
		RX_LINESPLITTER = /^(?:([^:]*?):)?([^;]*);?(.*)*?$/i,
		RX_CODESPLITTER = /^\s*((?:[a-zA-Z_][a-zA-z0-9]*?|\*)\s*=|[a-zA-Z]{3}|\.[a-zA-Z]*)\s*(.*)$/i


	return Util.extend(Object, {
		constructor: function(config) {
			this.init(config);
		},

		pc: undefined,

		init: function(config) {
			this.config = config;

			this.defaultStart = config.defaultStart || 0x1000;
			this.scope = config.scope || this;
			this.messagesCb = config.messagesCb || function() {};
			this.opcodes = config.opcodes || ASM.Opcode;
		},

		compile: function(text) {
			console.clear();
			this.labels = {};
			this.lines = text.split("\n");
			this.pc = this.defaultStart;
			this.data = [];

			this.pass1();
			this.pass2();
		},

		// pass #1 collecting labels
		pass1: function() {
			for (var i = 0, len = this.lines.length; i < len; i++) {
				var line = this.lines[i],
					parts = this.evalLine(line, i),
					labelName;

				this.data[i] = {
					line: line,
					pc: undefined,
					length: undefined,
					empty: parts.empty,
					parts: parts
				};

				if (parts.label !== undefined) {
					labelName = parts.label;

					if (this.labels[labelName]) {
						throw new Error("Duplicate label: ", labelName, "");
					}

					this.labels[labelName] = { line: i, length: 2 }   // all the program labels have 2bytes  length
				}
			}
		},

		// collection constants
		pass2: function() {
			for (var i = 0, len = this.data.length; i < len; i++) {
				var lineData = this.data[i];

				console.info(lineData);
			}
		},
		isEmptyLine: function(line) {
			return line.match(RX_EMPTYLINE);
		},

		getCode: function() {
			//
		},

		evalLine: function(line, num) {
			if (this.isEmptyLine(line)) {
				return {
					label: undefined,
					opcode: undefined,
					args: undefined,
					comment: undefined,
					empty: true
				}
			}
			else {
				var parts = RX_LINESPLITTER.exec(line),
					codeParts;

				if (parts === null) {
					this.log("syntax error at line #"+ num);
					throw new Error("Syntax error at " + num);
				}

				codeParts = this.splitCode(parts[2], num);

				return {
					label: parts[1],
					opcode: codeParts.code,
					args: codeParts.args,
					comment: parts[4],
					empty: false
				}
			}

		},

		splitCode: function(str, num) {
			var codeParts = RX_CODESPLITTER.exec(str);

			if (codeParts === null) {
				this.log("syntax error: line is neither an opcode nor an assignment");
				throw new Error("syntax error in #"+num+": line is neither an opcode nor an assignment")
			}

			return {
				code: codeParts[1],
				args: codeParts[2]
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
