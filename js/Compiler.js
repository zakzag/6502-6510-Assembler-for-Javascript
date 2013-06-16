/*
 * Compiler class, is able to compile text into byte code using separate 
 * class for Opcodes and Directives.
 * 
 * vegigmegyuk minden soron
 * ha * = <kifejezes> akkor a pc abban a sorban beallitodik
 * ha label van benne, akkor a label = pc
 * ha ertekadas, akkor megnezzuk milyen hosszu
 *     - ha van benne * vagy label, akkor 2byte
 *     - ha nincs, akkor megnezzuk, mi a vegeredmeny,
 *       annak fuggvenyeben 1 vagy 2 byte
 * identifiers hash:
 *     {
 *         "name": {
 *             value: <number>  (ha NaN, akkor nincs feldolgozva)
 *             length: <number> (1|2)
 *         },...
 *     }
 * 
 * vegigmegyunk minden soron
 * ha opcode, akkor kiszamoljuk a hosszat
 *     ha nincs operandus, akkor adott
 *     ha bizonytalan, akkor megnezzuk az operandus hosszat
 *       (annak mar benne kell lennie az identifiers tablaban)
 * ha direktiva, akkor tudjuk, milyen hosszu
 * megnoveljuk a pc erteket ennek megfeleloen
 * 
 * vegigmegyunk minden soron
 * beallitjuk a labelek erteket
 * 
 * vegigmegyunk minden azonositon
 * kiszamoljuk az azonositok erteket  
 * 
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
		//RX_VALUE_SPLITTER = /^\s*(<|>)*\s*(((\$)([a-zA-Z0-9]*))|([0-9]*)|(%)([01]*)|([a-zA-Z_0-9]*)|(\*))\s*$/i,
		RX_VALUE_SPLITTER = /^\s*(((\$)([a-zA-Z0-9]*))|([0-9]*)|(%)([01]*)|([a-zA-Z_0-9]*)|(\*))\s*$/i,
		RX_LINESPLITTER = /^(?:([^:]*?):)?([^;]*);?(.*)*?$/i,
		RX_CODESPLITTER = /^\s*((?:[a-zA-Z_][a-zA-z0-9]*?|\*)\s*=|[a-zA-Z]{3}|\.[a-zA-Z]*)\s*(.*)$/i,
		
		RX_ADDRTYPE_IMM = /^#(.*)$/i,
		RX_ADDRTYPE_INDY = /^\(([^\)]*)\)\s*,\s*y$/i,
		RX_ADDRTYPE_INDX = /^\(([^\)]*)\s*,\s*x\)$/i,
		RX_ADDRTYPE_IND = /^\(([^\),]*)\)$/i,
		RX_ADDRTYPE_ABSY = /^([^,\(\)]*)\s*,\s*y$/i,
		RX_ADDRTYPE_ABSX = /^([^,\(\)]*)\s*,\s*x$/i,
		RX_ADDRTYPE_ABS = /^([^,]*)$/i,
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
			this.directives = config.directives || ASM.Directive;
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

			this.pass0();
			this.pass1();
			//this.pass2();
		},
		// pass0 preprocess identifiers' lengths
		pass0: function() {
			this.pc = this.defaultStart;
			
			for (var i = 0, len = this.lines.length; i < len; i++) {
				this.currentLine = i;
				
				var line = this.lines[i],
					parts = this.splitLine(line),
					lineData,
					fnName;
				
				this.data[i] = lineData = {
					line: line,            // the whole line as string
					pc: this.pc,         // program counter in the line
					length: undefined,     // how long as a machine code
					type: parts.type,      // is this an empty line?
					parts: parts,          // part of the line, separated by function
					code: undefined        // actual machine code
				};
				
				fnName = "pass0" + parts.type;
				this[fnName] && this[fnName](lineData);
				
				if (parts.label) {
					this.setIdentifier(parts.label, this.pc, 2);
				}
			}
			
			console.info("ids", this.identifiers);
		},
				
		pass0PC: function(lineData) {
			this.pc = this.evalExpression(lineData.parts.args).value;
		},
		pass0Assignment: function(lineData) {
			var eval = this.evalExpression(lineData.parts.args);
			var label = RX_IDENTIFIER.exec(lineData.parts.code)[1]
			this.setIdentifier(label, eval.value, eval.length);
		},
		
		// calculate opcode lengths
		pass1: function() {
			var fnName,
				lineData;
			this.pc = this.defaultStart;
			
			for (var i = 0, len = this.lines.length; i < len; i++) {
				this.currentLine = i;
				lineData = this.data[i];// atirni each-re
				
				fnName = "pass1" + lineData.parts.type;
				this[fnName] && this[fnName](lineData);
			}
			
			console.info("addmegmagad", this.identifiers);
		},	
				
		pass1Opcode: function(lineData) {
			var opcodes = this.opcodes,
				opcode = lineData.parts.code.toUpperCase(),
				args = lineData.parts.args;
		
			var opcodeData = this.getOpcodeData(opcode, args);
			this.pc += opcodeData
		},
				
		getOpcodeData: function(opcode, args) {
			var addressingModeData = this.getAddressingMode(opcode, args),
				addressingMode = addressingModeData.type,
				arg = addressingModeData.arg,
				valueData = this.evalExpression(arg),
				value = valueData.value,
				argLength = valueData.length,
				opInfo = this.opcodes[opcode];
			
			if (addressingMode === "ABS") {
				if (opInfo[ASM.AddressingMode.ABS.index] === 0x00) {
					if (opInfo[ASM.AddressingMode.REL.index] !== 0x00) {
						addressingMode = "REL"
					};
 				} else {
					if (argLength === 1) {
						addressingMode = "ZP"
					};
				};
			};
			
			if (addressingMode === "ABSX" && argLength === 1) {
				addressingMode = "ZPX";
			} 
			
			if (addressingMode === "ABSY" && argLength === 1) {
				addressingMode = "ZPY";
			}
			
			return {
			// ide kell ay ertekek meg byteok	
			}
			console.info(">>value", opcode, opInfo[ASM.AddressingMode[addressingMode].index], this.evalExpression(arg).value);
		},
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
				(RX_OPCODE_TYPE.exec(body) ? TYPE_OPCODE : TYPE_UNDEFINED)));
		},
				
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
		/*
*=$c000

lda #$00
ldx #$01
loop:
sta $0400,x
sta $0500,x
dex
bne loop
rts
		 */

		splitCode: function(str) {
			var codeParts = RX_CODESPLITTER.exec(str);

			if (codeParts === null) {
				console.info("err",str, str.length);
				throw new ASM.Error.Syntax("line is neither an opcode nor an identifier", this.currentLine);
			}

			return {
				code: codeParts[1],
				args: codeParts[2]
			}
		},

		evalExpression: function(expression) {
			var exprParts = expression.trim().split(RX_EXPRESSION_SPLITTER),
				operators = expression.match(RX_OPERATOR_COLLECTOR),
				resultData,
				partN,
				valueDataN;
			
			resultData = this.evalValue(exprParts[0]);
			
			for (var i = 1, len = exprParts.length; i < len; i++) {
				var partN = exprParts[i],
					valueDataN = this.evalValue(partN),
					operator = operators[i - 1];
				
				resultData.length = valueDataN.length > resultData.length ? valueDataN.length : resultData.length; 
				if (!isNaN(resultData.value)) {
					resultData.value = this["operator" + OPERATOR_MAP[operator]].call(this, resultData.value, valueDataN.value);
				}
			}
			return resultData;
		},
				
		operatorAdd: function(op1, op2) {
			return op1 + op2;
		},
				
		operatorSub: function(op1, op2) {
			return op1 - op2;
		},
		
		evalValue: function(value) {
			var valueParts = RX_VALUE_SPLITTER.exec(value),
				result,
				length;
			
			if(valueParts === null) {
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
			
			//console.info(value, result,":", valueParts);
			if (result === undefined) {
				console.warn("not set:", valueParts);
				//throw new ASM.Error.Invalid("invalid value: "+ value, this.currentLine);
			}

			return {
				value: result,
				length: length
			}
		},
		setIdentifier: function(id, value, length) {
			this.identifiers[id] = {
				value: value,
				length: length
			};
		},
				
		getIdentifier: function(id) {
			var idData = this.identifiers[id]
			
			return idData ? idData : { value: undefined, length: undefined };
		}
	});
})();
