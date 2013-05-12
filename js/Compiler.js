/*
 * Compiler class, is able to compile text into byte code using separate 
 * class for Opcodes and Directives.
 * Has a 
 */
ASM.Compiler = (function() {
	var RX_EMPTYLINE = /^\s*$/i,
		RX_IDENTIFIER = /^\s*([^\s]+)\s*=\s*$/i,
		
		RX_ASSIGNMENT_TYPE = /^\s*([a-zA-Z_][a-zA-Z0-9]*)\s*=\s*$/i,
		RX_PC_TYPE = /^\s*(\*)\s*=\s*$/i,
		RX_OPCODE_TYPE = /[a-zA-Z]{3}/i,
		RX_DIRECTIVE_TYPE = /\.\w+/i,
		
		RX_EXPRESSION_SPLITTER = /\s*[\+\-]\s*/i,
		RX_OPERATOR_COLLECTOR = /[+\-]/g,
		RX_DIRECTIVE_SPLITTER = /,/i,
		RX_VALUE_SPLITTER = /^\s*(<|>)*\s*(((\$)([a-zA-Z0-9]*))|([0-9]*)|(%)([01]*)|([a-zA-Z_0-9]*)|(\*))\s*$/i,
		RX_LINESPLITTER = /^(?:([^:]*?):)?([^;]*);?(.*)*?$/i,
		RX_CODESPLITTER = /^\s*((?:[a-zA-Z_][a-zA-z0-9]*?|\*)\s*=|[a-zA-Z]{3}|\.[a-zA-Z]*)\s*(.*)$/i,
		
		TYPE_DIRECTIVE = "Directive",
		TYPE_PC = "PC",
		TYPE_ASSIGNMENT = "Assignment",
		TYPE_OPCODE = "Opcode",
		TYPE_UNDEFINED = "Undefined";
		
		OPERATOR_MAP = {
			"+": "Add",
			"-": "Sub"
		}


	return ASM.Util.extend(Object, {
		constructor: function(config) {
			this.init(config);
		},

		pc: undefined,

		init: function(config) {
			/** @var {object} config     is permanent, so are saved into this.config */
			this.config = config;
			
			/** @var {number} defaultStart    is the starting address if no * set  */
			this.defaultStart = config.defaultStart || 0x1000;
			/** @var {object} scope     is needed for callback functions */
			this.scope = config.scope || this;
			/** @var {undefined|number} currentLine      while compiling, it shows which line is under process
			 *                                           used in error messages  */
			this.currentLine = undefined;
			/** @var {object}   opcodes    list of valid opcodes */
			this.opcodes = config.opcodes || ASM.Opcode;
			/** @var {object}   directives    list of valid directives */
		},
		/**
		 * Compiles any string into byte code using this.opcodes
		 * 
		 * @param {string} text       text to compile
		 * @returns {string}          byte code in string
		 */
		compile: function(text) {
			console.clear();
			this.identifiers = {};
			this.lines = text.split("\n");
			this.pc = this.defaultStart;
			this.data = [];

			this.pass1();
			this.pass2();
		},

		// pass #1 collecting labels
		pass1: function() {
			for (var i = 0, len = this.lines.length; i < len; i++) {
				this.currentLine = i;
				
				var line = this.lines[i],
					parts = this.evalLine(line),
					labelName;
			
				this.data[i] = {
					line: line,            // the whole line as string
					pc: undefined,         // program counter in the line
					length: undefined,     // how long as a machine code
					empty: parts.empty,    // is this an empty line?
					parts: parts,          // part of the line, separated by function
					code: undefined        // actual machine code
				};

				if (parts.label !== undefined) {
					labelName = parts.label;

					if (this.identifiers[labelName] !== undefined) {
						throw new ASM.Error.DuplicateIdentifier(labelName, i);
					}

					this.identifiers[labelName] = { line: i, length: 2, value: undefined }   // all the program labels have 2bytes  length
				}
			}
		},

		// collection constants, do everything
		pass2: function() {
			for (var i = 0, len = this.data.length; i < len; i++) {
				this.currentLine = i;
				var lineData = this.data[i];
				if (!lineData.empty) {
					var type = this.getLineType(lineData.parts.code),
						processFn = this["process" + type];
					lineData.type = type;
					// returns byte code (miert nem  megy this nelkul?)
					processFn.call(this, lineData.parts.code, lineData.parts.args);
				};
			}
		},
		isEmptyLine: function(line) {
			return line.match(RX_EMPTYLINE);
		},

		getLineType: function(body) {
			return RX_DIRECTIVE_TYPE.exec(body) ? TYPE_DIRECTIVE :
				(RX_ASSIGNMENT_TYPE.exec(body) ? TYPE_ASSIGNMENT :
				(RX_PC_TYPE.exec(body) ? TYPE_PC :
				(RX_OPCODE_TYPE.exec(body) ? TYPE_OPCODE : TYPE_UNDEFINED)));
		},
				
		processAssignment: function(body, args) {
			console.info("assignment",body,args);
			var identifierName = RX_IDENTIFIER.exec(body)[1];
			this.identifiers[identifierName] = this.evalExpression(args);
		},
				
		processPC: function(body, args) {
			this.pc = this.evalExpression(args);
		},
				
		processOpcode: function(body, args) {
			console.info("opcode", body, args);
		},
		
		processDirective: function(body, args) {
			console.info("directive", body, args);
		},
				
		processUndefined: function(body, args) {
			console.info("undefined", body, args);
			ASM.Error.Syntax("Line not recognized neither as Assignment nor opcode nor directive", this.currentLine);
		},

		evalLine: function(line) {
			if (this.isEmptyLine(line)) {
				return {
					label: undefined,
					code: undefined,
					args: undefined,
					comment: undefined,
					empty: true
				}
			}
			else {
				var parts = RX_LINESPLITTER.exec(line),
					codeParts;

				if (parts === null) {
					throw new ASM.Error.Syntax("invalid line", this.currentLine);
				}

				codeParts = this.splitCode(parts[2], this.currentLine);

				return {
					label: parts[1],
					code: codeParts.code,
					args: codeParts.args,
					comment: parts[4],
					empty: false
				};
			}
			
		},

		splitCode: function(str, num) {
			var codeParts = RX_CODESPLITTER.exec(str);

			if (codeParts === null) {
				throw new ASM.Error.Syntax("line is neither an opcode nor an identifier", num);
			}

			return {
				code: codeParts[1],
				args: codeParts[2]
			}
		},

		getAddressingMode: function(expression) {

		},

		evalExpression: function(expression) {
			var exprParts = expression.trim().split(RX_EXPRESSION_SPLITTER),
				operators = expression.match(RX_OPERATOR_COLLECTOR),
				result = this.evalValue(exprParts[0]);
			
			for (var i = 1, len = exprParts.length; i < len; i++) {
				var partN = exprParts[i],
					valueN = this.evalValue(partN),
					operator = operators[i - 1];
				
				result = this["operator" + OPERATOR_MAP[operator]].call(this, result, valueN);
			}
			
			return result;
		},
				
		operatorAdd: function(op1, op2) {
			return op1 + op2;
		},
				
		operatorSub: function(op1, op2) {
			return op1 - op2;
		},
		
		evalValue: function(value) {
			var valueParts = RX_VALUE_SPLITTER.exec(value),
				result;
			
			if(valueParts === null) {
				throw new ASM.Error.Syntax("value cannot be processed:" + value, this.currentLine);
			}
			
			// hexa
			if (valueParts[5] !== undefined) {
				console.info("hex", valueParts[5]);
				result = parseInt(valueParts[5], 16);
			// binary
			} else if (valueParts[8] !== undefined) {
				console.info("bin", valueParts[8]);
				result = parseInt(valueParts,2);
			// decimal
			} else if (valueParts[6] !== undefined) {
				console.info("dec", valueParts[6]);
				result = parseInt[6];
			// pc (*)
			} else if (valueParts[10] !== undefined) {
				console.info("pc", this.pc);
				result = this.pc;
			} else if (valueParts[9] !== undefined) {
				console.info("id", valueParts[9]);
				result = this.getIdentifier(valueParts[9])
			}
			
			console.info(value, result);
			if (isNaN(result)) {
				throw new ASM.Error.Invalid("invalid value: "+ value, this.currentLine);
			}
			return value;
		},
				
		getIdentifier: function(id) {
			var value = this.identifiers[id].value;
			if (value === undefined) {
				throw new ASM.Error.UnknownIdentifier(id, this.currentLine);
			}
			return value;
		}
	});
})();
