/*
 * Compiler class, is able to compile text into byte code using separate 
 * class for Opcodes and Directives.
 */
ASM.Compiler = (function() {
	var RX_EMPTYLINE = /^\s*$/i,
		RX_IDENTIFIER = /^\s*([^\s]+)\s*=\s*$/i,
		
		RX_ASSIGNMENT_TYPE = /^\s*([a-zA-Z_][a-zA-Z0-9]*)\s*=\s*$/i,
		RX_PC_TYPE = /^\s*(\*)\s*=\s*$/i,
		RX_OPCODE_TYPE = /^[a-zA-Z]{3}$/i,
		RX_EMPTY_TYPE = /^\s*$/i,
		RX_DIRECTIVE_TYPE = /\.\w+/i,
		
		RX_EXPRESSION_SPLITTER = /\s*[\+\-]\s*/i,
		RX_OPERATOR_COLLECTOR = /[+\-]/g,
		RX_DIRECTIVE_SPLITTER = /,/i,
		//RX_VALUE_SPLITTER = /^\s*(<|>)*\s*(((\$)([a-zA-Z0-9]*))|([0-9]*)|(%)([01]*)|([a-zA-Z_0-9]*)|(\*))\s*$/i,
		RX_VALUE_SPLITTER = /^\s*(((\$)([a-zA-Z0-9]*))|([0-9]*)|(%)([01]*)|([a-zA-Z_0-9]*)|(\*))\s*$/i,
		RX_LINESPLITTER = /^(?:([^:]*?):)?([^;]*);?(.*)*?$/i,
		RX_CODESPLITTER = /^\s*((?:[a-zA-Z_][a-zA-z0-9]*?|\*)\s*=|[a-zA-Z]{3}|\.[a-zA-Z]*)\s*(.*)$/i,
		
		RX_ADDRTYPE_IMM = /^#(.*)$/i,
		RX_ADDRTYPE_INDY = /^\(([^\)]*)\)\s*,\s*y\s*$/i,
		RX_ADDRTYPE_INDX = /^\(([^\)]*)\s*,\s*x\)\s*$/i,
		RX_ADDRTYPE_IND = /^\(([^\),]*)\)\s*$/i,
		RX_ADDRTYPE_ABSY = /^([^,\(\)]*)\s*,\s*y\s*$/i,
		RX_ADDRTYPE_ABSX = /^([^,\(\)]*)\s*,\s*x\s*$/i,
		RX_ADDRTYPE_ABS = /^([^,]*)\s*$/i,
		RX_ADDRTYPE_IMP = /^\s*$/i,
		
		TYPE_DIRECTIVE = "Directive",
		TYPE_PC = "PC",
		TYPE_ASSIGNMENT = "Assignment",
		TYPE_OPCODE = "Opcode",
		TYPE_EMPTY = "Empty",
		TYPE_UNDEFINED = "Undefined";
		
		OPERATOR_MAP = {
			"+": "Add",
			"-": "Sub"
		}

	return ASM.Util.extend(Object, {
		constructor: function(config) {
			this.init(config);
		},

		/** @var {number} pc     Program counter: contains the current position 
		 *                       of the program counter during compiling
		 */ 
		pc: undefined,
		/** @var {number} currentLine     Program counter: contains the current 
		 *                                line number during compiling
		 */ 
		currentLine: undefined,
		/**
		 * Initializes compiler
		 * 
		 * @param {object} config
		 * @returns {undefined}
		 */
		init: function(config) {
			/** @var {object} config     is permanent, so are saved into this.config */
			this.config = config;
			
			this.defaultStart = config.defaultStart || 0x1000;
			this.scope = config.scope || this;
			this.currentLine = undefined;
			this.opcodes = config.opcodes || ASM.Opcode;
			this.directives = {};
			this.output = undefined;
			this.outputs = {};
		},
				
		/**
		 * Adds a new directive type to the compiler
		 * 
		 * @param {string} name
		 * @param {ASM.Directive} directive
		 * @returns {undefined}
		 */
		addDirective: function(name, directiveObj) {
			this.directives[name] = directiveObj;
		},
				
		addOutput: function(name, outputObj) {
			this.outputs[name] = outputObj
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
			this.output = [];

			this.pass0();
			this.pass1();
			this.pass2();
			this.pass3();
			this.pass4();
		},
		/**
		 * Pass #0: Preprocess identifiers
		 * @returns {undefined}
		 */
		pass0: function() {
			this.pc = this.defaultStart;
			window.dd = this;
			
			for (var i = 0, len = this.lines.length; i < len; i++) {
				this.currentLine = i;
				
				var line = this.lines[i],
					parts = this.splitLine(line),
					lineData,
					fnName;
				
				this.data[i] = lineData = {
					line: line,            // the whole line as string
					pc: this.pc,           // program counter in the line
					length: undefined,     // how long as a machine code
					type: parts.type,      // is this an empty line?
					directiveData: undefined, // only set, when directive present in the current line
					opcodeData: undefined, // only set, when opcode is present in the current line
					parts: parts,          // part of the line, separated by function
					code: undefined        // actual machine code
				};
				
				// call the function according to the line type
				fnName = "pass0" + parts.type;
				this[fnName] && this[fnName](lineData);
			}
		},
				
		/**
		 * if * found, set PC
		 * @param {object} lineData
		 * 
		 * @returns {undefined}
		 */
		pass0PC: function(lineData) {
			this.pc = lineData.pc = this.evalExpression(lineData.parts.args).value;
		},
		/**
		 * Identifier resolution, pass0. Identifier not necesserily resolved,
		 * but its length is defined  (for pass1)
		 * 
		 * @param {type} lineData
		 * @returns {undefined}
		 */
		pass0Assignment: function(lineData) {
			var expressionData = this.evalExpression(lineData.parts.args);
			var label = RX_IDENTIFIER.exec(lineData.parts.code)[1]
			this.setIdentifier(label, expressionData.value, expressionData.length, lineData.parts.args);
		},
		
		/**
		 * Pass1: calculates opcode lengths, so all the identifiers will be
		 *        resolvable including labels.
		 *        
		 * @returns {undefined}
		 */
		pass1: function() {
			var fnName,
				lineData;
			this.pc = this.defaultStart;
			
			for (var i = 0, len = this.lines.length; i < len; i++) {
				this.currentLine = i;
				
				lineData = this.data[i];// atirni each-re
				if (lineData.parts.label) {
					this.setIdentifier(lineData.parts.label, this.pc, 2, "*");
				}
				
				lineData.pc = this.pc;
				
				fnName = "pass1" + lineData.parts.type;
				this[fnName] && this[fnName](lineData);
				
				// TODO: pass1Directive-t megcsinalni, mert a directive utani labelek nem lesznek jok;
			}
		},
		/**
		 * Pass1 sub: sets the program counter
		 * 
		 * @param {object} lineData
		 * @returns {undefined}
		 */
		pass1PC: function(lineData) {
			lineData.pc = this.pc;
			this.pc = this.evalExpression(lineData.parts.args).value;
		},
		/**
		 * Pass1 sub: Processes opcode
		 * 
		 * @param {type} lineData
		 * @returns {undefined}
		 */
		pass1Opcode: function(lineData) {
			var opcodes = this.opcodes,
				opcode = lineData.parts.code.toUpperCase(),
				args = lineData.parts.args;
		
			var opcodeData = this.getOpcodeData(opcode, args);
			lineData.opcodeData = opcodeData;
			this.pc +=  opcodeData.length;
		},
		
		/**
		 * Pass2: resolves all identifiers, stops when unable to do it.
		 * 
		 * @returns {undefined}
		 */
		pass2: function() {
			for (var identifierName in this.identifiers) {
				var identifier = this.identifiers[identifierName];
				if (isNaN(identifier.value) || identifier.value === undefined) {
					this.setIdentifier(identifierName, this.evalExpression(identifier.expression));
				}
			}
		},
		/**
		 * Pass3: finalize opcode arguments (replaces identifiers resolved in pass2)
		 * @returns {undefined}
		 */		
		pass3: function() {
			var fnName,
				lineData;
			this.pc = this.defaultStart;
			
			for (var i = 0, len = this.lines.length; i < len; i++) {
				this.currentLine = i;
				
				lineData = this.data[i];// atirni each-re
				fnName = "pass3" + lineData.parts.type;
				this[fnName] && this[fnName](lineData);
			}
		},
		/**
		 * Pass3: sets program counter
		 * 
		 * @param {object} lineData
		 * @returns {undefined}
		 */
		pass3PC: function(lineData) {
			lineData.pc = this.pc;
			this.pc = this.evalExpression(lineData.parts.args).value;
		},
				
		/**
		 * Pass3 sub: processes an opcode
		 * 
		 * @param {type} lineData
		 * @returns {undefined}
		 */
		pass3Opcode: function(lineData) {
			var opcodes = this.opcodes,
				opcode = lineData.parts.code.toUpperCase(),
				args = lineData.parts.args;
		
			var opcodeData = this.getOpcodeData(opcode, args);
			lineData.opcodeData = opcodeData;
			this.pc +=  opcodeData.length;
		},
				
		/**
		 * Pass3: 
		 * 
		 * @param {type} lineData
		 * @returns {undefined}
		 */
		pass3Directive: function(lineData) {
			var directiveClassName = lineData.parts.code.substr(1);
			var directive = this.directives[directiveClassName];
			if (directive) {
				directive.setData(lineData.parts.args);
				
				var parsed = directive.parse();
				
				lineData.directiveData = parsed;
			
				this.pc += parsed.length;
			} else {
				console.info("no such directive installed:", lineData.parts.code.substr(1));
				// error handling: no such directive installed
			}
		},
		/**
		 * Pass4: Creates output data
		 * 
		 * @returns {unresolved}
		 */
		pass4: function() {
			var output = [],
				lineData,
				fnName;
		
			for (var i = 0, len = this.lines.length; i < len; i++) {
				this.currentLine = i;
				
				lineData = this.data[i];// atirni each-re
				fnName = "pass4" + lineData.parts.type;
				this[fnName] && this[fnName](lineData);
			}
			
			return this.output;
		},
		/**
		 * Pass4 sub: get&add Opcode data
		 * @param {type} lineData
		 * @returns {undefined}
		 */
		pass4Opcode: function(lineData) {
			this.output = this.output.concat(lineData.opcodeData.data)
		},
		/**
		 * Pass4 sub: get&add Directive data
		 * @param {type} lineData
		 * @returns {undefined}
		 */
		pass4Directive: function(lineData) {
			this.output = this.output.concat(lineData.directiveData.data)
		},
				
		generate: function(outputType) {
			var outputGenerator = this.outputs[outputType];
			
			if(outputGenerator instanceof ASM.Output) {
				return outputGenerator.parse(this.data, this.output)
			} else {
				console.info("no such output type:", outputType);
				// error handling
			}
		},
		/**
		 * Processes opcode (evaluates expressions, calculates addressing mode, opcode length)
		 * 
		 * @param {string} opcode
		 * @param {string} args
		 * @returns {Object} opcode internal data
		 */
		getOpcodeData: function(opcode, args) {
			var addressingModeData = this.getAddressingMode(opcode, args),
				addressingMode = addressingModeData.type,
				arg = addressingModeData.arg,
				valueData = this.evalExpression(arg),
				value = valueData.value,
				originalValue = value,
				argLength = valueData.length,
				opInfo = this.opcodes[opcode],
				result;
			
			if (addressingMode === "ABS") {
				if (opInfo[ASM.AddressingMode.ABS.index] === 0x00) {
					if (opInfo[ASM.AddressingMode.REL.index] !== 0x00) {
						addressingMode = "REL"
					} else {
						// error
					};
 				} else {
					if (argLength === 1) {
						addressingMode = "ZP"
					};
				};
			};
			
			if(addressingMode === "REL") {
				argLength = 1;
				if (this.pc < value) {
					value -= this.pc;
				} else {
					value = 0xff - (this.pc - value);
				}
			}
			
			if (addressingMode === "IMP") {
				argLength = 0;
			}
			
			if (addressingMode === "ABSX" && argLength === 1) {
				addressingMode = "ZPX";
			} 
			
			if (addressingMode === "ABSY" && argLength === 1) {
				addressingMode = "ZPY";
			}
			
			result = {
				opcode: opcode,
				addressingMode: addressingMode,
				length: argLength + 1,
				arg: addressingModeData.arg,
				argValue: value,
				originalArgValue: originalValue,
				data: []
			};
			
			result.data.push(opInfo[ASM.AddressingMode[addressingMode].index]);
			argLength >= 1 && result.data.push(value & 0xff);
			argLength >= 2 && result.data.push((value & 0xff00) >>> 8);

			return result;
		},
		/**
		 * Calculates addressing mode and opcode length
		 * 
		 * @param {string} code
		 * @param {arg} arg
		 * @returns {object}
		 */
		getAddressingMode: function(code, arg) {
			var matchIMP = arg.match(RX_ADDRTYPE_IMP),
				matchIMM = arg.match(RX_ADDRTYPE_IMM),
				matchABS = arg.match(RX_ADDRTYPE_ABS),
				matchABSX = arg.match(RX_ADDRTYPE_ABSX),
				matchABSY = arg.match(RX_ADDRTYPE_ABSY),
				matchIND = arg.match(RX_ADDRTYPE_IND),
				matchINDX = arg.match(RX_ADDRTYPE_INDX),
				matchINDY = arg.match(RX_ADDRTYPE_INDY),
				match = matchIMP || matchIMM || matchABSX || matchABSY || matchIND || matchINDX || matchINDY  || matchABS,
				type;
		
			if (matchIMP) { type = "IMP"; }
			else if (matchIMM) { type = "IMM"; arg = matchIMM[1]; }
			else if (matchABSX) { type = "ABSX"; arg = matchABSX[1]; }
			else if (matchABSY) { type = "ABSY"; arg = matchABSY[1]; }
			else if (matchIND) { type = "IND";  arg = matchIND[1];}
			else if (matchINDX) { type = "INDX";  arg = matchINDX[1];}
			else if (matchINDY) { type = "INDY";  arg = matchINDY[1];}
			else if (matchABS) { type = "ABS";  arg = matchABS[1];}
			
			return {
				type: type,
				arg: arg
			}
		},
				
		/**
		 * Checks whether the given line is empty or not (has any actual code or just whitespace)
		 * 
		 * @param {type} line      the current line to investigate    
		 * @returns {boolean}
		 */
		isEmptyLine: function(line) {
			return line.match(RX_EMPTYLINE);
		},
				
		/**
		 * Checks the line body, and returns its type.
		 * (directive, assignment, pc assignment, opcode, undefined)
		 * 
		 * @param {type} body   Line body.
		 * @returns {string}    Type of the line.
		 */
		getLineType: function(body) {
			return RX_DIRECTIVE_TYPE.exec(body) ? TYPE_DIRECTIVE :
				(RX_ASSIGNMENT_TYPE.exec(body) ? TYPE_ASSIGNMENT :
				(RX_PC_TYPE.exec(body) ? TYPE_PC :
				(RX_OPCODE_TYPE.exec(body) ? TYPE_OPCODE : 
				(RX_EMPTY_TYPE.exec(body)? TYPE_EMPTY : TYPE_UNDEFINED))));
		},
		/**
		 * Processes a line by splitting into chunks and organizes into a hash
		 * 
		 * @param {string} line
		 * @returns {object}   line metainfo
		 */
		splitLine: function(line) {
			if (this.isEmptyLine(line)) {
				return {
					label: undefined,
					code: undefined,
					args: undefined,
					comment: undefined,
					type: TYPE_EMPTY
				}
			}
			else {
				var parts = RX_LINESPLITTER.exec(line),
					codeParts;

				if (parts === null) {
					console.info("error in line", this.currentLine);
					throw new ASM.Error.Syntax("invalid line", this.currentLine);
				}

				codeParts = this.splitCode(parts[2]);

				return {
					label: parts[1],
					code: codeParts.code,
					args: codeParts.args,
					comment: parts[4],
					type: this.getLineType(codeParts.code)
				};
			};
		},
		/**
		 * Processes code part of a line (for assignment, opcode, directive types)
		 * @param {string} str
		 * @returns {object}  code metainfo
		 */
		splitCode: function(str) {
			if (this.isEmptyLine(str)) {
				return {
					code: "",
					args: ""
				}
			} 
			var codeParts = RX_CODESPLITTER.exec(str);

			if (codeParts === null) {
				console.info("Syntax error",str, str.length);
				throw new ASM.Error.Syntax("line is neither an opcode nor an identifier", this.currentLine);
			}

			return {
				code: codeParts[1],
				args: codeParts[2]
			}
		},

		/**
		 * Evaluates an expression. If it is impossible, at least its length
		 * 
		 * @param {string} expression
		 * @returns {object} expression metadata
		 */
		evalExpression: function(expression) {
			var exprParts = expression.trim().split(RX_EXPRESSION_SPLITTER),
				operators = expression.match(RX_OPERATOR_COLLECTOR),
				resultData,
				partN,
				valueDataN,
				firstExpr = exprParts[0],
				hiLoSelector = this.getHiLoSelector(firstExpr) ? firstExpr[0][0] : undefined;
			
			resultData = this.evalValue(hiLoSelector ? firstExpr.substr(1)  :exprParts[0]);
			
			for (var i = 1, len = exprParts.length; i < len; i++) {
				var partN = exprParts[i],
					valueDataN = this.evalValue(partN),
					operator = operators[i - 1];
				
				resultData.length = valueDataN.length > resultData.length ? valueDataN.length : resultData.length; 
				if (!isNaN(resultData.value)) {
					resultData.value = this["operator" + OPERATOR_MAP[operator]].call(this, resultData.value, valueDataN.value);
				}
			}
			
			if (hiLoSelector) {
				resultData.length = 1;
				if (hiLoSelector === "<") {
					resultData.value = resultData.value & 0xff;
				} else {
					resultData.value = (resultData.value & 0xff00) >>> 8;
				}
			}
			return resultData;
		},
		/**
		 * Whether expression has < or > (so the expression is 1 byte long)
		 * @param {type} expr
		 * @returns {unresolved}
		 */
		getHiLoSelector: function(expr) {
			var firstChar = expr[0];
			
			return (firstChar === "<" || firstChar === ">");
		},
		/**
		 * Add operator method
		 * 
		 * @param {number} op1
		 * @param {number} op2
		 * @returns {number}
		 */
		operatorAdd: function(op1, op2) {
			return op1 + op2;
		},
		
		/**
		 * Substract operator method
		 * 
		 * @param {number} op1
		 * @param {number} op2
		 * @returns {number}
		 */
		operatorSub: function(op1, op2) {
			return op1 - op2;
		},
		
		/**
		 * Evaluates a value, called by evalExpression, replaces identifiers
		 * to its value if possible, also calculates value length
		 * 
		 * @param {string} value
		 * @returns {object}  value metadata
		 */
		evalValue: function(value) {
			var valueParts = RX_VALUE_SPLITTER.exec(value),
				result,
				length;
			
			if(valueParts === null) {
				console.info("Value cannot be processed", value);
				throw new ASM.Error.Syntax("value cannot be processed:" + value, this.currentLine);
			}
			// hexa
			if (valueParts[4] !== undefined) {
				result = parseInt(valueParts[4], 16);
				length = result > 0xff ? 2 : 1;
			// binary
			} else if (valueParts[7] !== undefined) {
				result = parseInt(valueParts[7],2);
				length = result > 0xff ? 2 : 1;
			// decimal
			} else if (valueParts[5] !== undefined) {
				result = parseInt(valueParts[5],10);
				length = result > 0xff ? 2 : 1;
			// pc (*)
			} else if (valueParts[9] !== undefined) {
				result = this.pc;
				length = 2;
			} else if (valueParts[8] !== undefined) {
				var resultData = this.getIdentifier(valueParts[8]);
				result = resultData.value;
				length = resultData.length;
			} else {
				//throw new ASM.Error.Invalid("illegal value: "+ value, this.currentLine);
			};
			
			if (typeof length !== "number") {
				console.warn("not set:", valueParts);
				//throw new ASM.Error.Invalid("invalid value: "+ value, this.currentLine);
			}

			return {
				value: result,
				length: length
			}
		},
				
		/**
		 * Sets an identifier defined by its name. Also stores the original
		 * expression for later use. (if identifier cannot be resolved,
		 * needs to be calculated later)
		 * 
		 * @param {type} id
		 * @param {type} value
		 * @param {type} length
		 * @param {type} expression
		 * @returns {undefined}
		 */
		setIdentifier: function(id, value, length, expression) {
			this.identifiers[id] = {
				value: value,
				length: length,
				expression: expression
			};
		},
		
		/**
		 * returns an identifier, if not exist returns an empty object, length
		 * is set to 2 (needed in pass1)
		 * 
		 * @param {type} id
		 * @returns {unresolved}
		 */
		getIdentifier: function(id) {
			var idData = this.identifiers[id]
			
			return idData ? idData : { value: undefined, length: 2, expression: undefined };
		}
	});
})();
