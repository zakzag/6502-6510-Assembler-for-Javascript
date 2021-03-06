
var Compiler = require("./Compiler");
var Opcode = require("./Opcode");
var Util = require("./Util");
var File = require("./File");

var TextDirective = require("./directive/Text");
var ByteDirective = require("./directive/Byte");
var WordDirective = require("./directive/Word");

var Output = require("./Output");
var RawOutput = require("./output/Raw");
var HumanreadableOutput = require("./output/Humanreadable");
var ProgramOutput = require("./output/Program");
var JsonOutput = require("./output/Json");
var util = require('util');

util.puts("6502/6510 Assember for Node.js V0.1.0\n\n");

/**
 * Assembler entry point. This file should be executed when a compilation
 * is meeded.
 * 
 * This is the object that holds everything together.
 *
 * ASM is a namespace for all the objects and classes used in this project.
 * All of them is under ASM, so the compiler is called ASM.Compiler
 *
 * ASM.Assember handles all events from the user interface, sends commands to the child
 * objects (Opcode, Compiler so far) and listens to them (using callback
 * functions). Later on it is possible to switch to Observable pattern to make it
 * be more OOP-like project.
 *
 * So far only works with chrome, mozilla, opera and safari, since IE has no attachEvent. 
 * Too lazy to implement cross-browser event handling
 *
 * usage: 
 * node asm6502.js i:<inputfile> o:<outputfile> t:<outputmode>
 * 
 * @param {string} inputfile        path to the input file
 * @param {string} outputfile       path to output file. will be overwritten
 *                                  if already exists
 * @param {string} outputmode       list of valid values depend on the installed
 *                                  output 
 * @requires {Compiler}
 * @requires {Opcode}
 * @requires {Util}
 * @requires {File}
 * @requires {TextDirective}
 * @requires {ByteDirective}
 * @requires {WordDirective}
 * @requires {Output}
 * @requires {RawOutput}
 * @requires {HumanreadableOutput}
 * @requires {ProgramOutput}
 * @requires {JsonOutput}
 * @requires {util}
 * 
 * @object assember
 */
var assembler = (function() {
	"use strict";
    var DEFAULT_CONFIG = {
		i: undefined,
		o: undefined,
		t: "raw"
	};
	
	return {
		/**
		 * Path to the input file
		 * @public
		 * @type {string}
		 */
		inputFile: undefined,
		/**
		 * Path to the output file.
		 * @public
		 * @type {string}
		 */
		outputFile: undefined,
		/**
		 * Content of the input file to be compiled.
		 * @type {string}
		 * @public
		 */
		inputContent: "",
		
		/**
		 * Initializes the assember by using config. Chainable.
		 * @param {object} config       Config object used for compiling
		 * @param {string} config.i     Input file name
		 * @param {string} config.o     Output file name
		 * @param {string} config.t     Type of the output. Type must match
		 *                              one of the installed output types.
		 * @throws {Error}   
		 * @returns {object}   Returns self to make it chainable.
		 */
		init: function(config) {
			config = Util.apply({}, config, DEFAULT_CONFIG);
			
			var inputFile = config.i,
				outputFile = config.o,
				type = config.t;
			
			this.compiler = config.compiler || new Compiler({
				scope: this,
				opcodes: Opcode.Opcode,
				outputMode: config.outputMode || "raw"
			});
			
			if(!inputFile) {
				throw new Error("You must specify an input file");
			}
			
			if(!outputFile) {
				throw new Error("You must specify an output file");
			}
			
			this.inputFile = inputFile;
			this.outputFile = outputFile;
			this.type = type;
			this.inputContent = File.getAsText(inputFile);
			
			// add all directives required for compiling (more can be added, if needed)
			this.compiler.addDirective("text", new TextDirective(this.compiler));
			this.compiler.addDirective("byte", new ByteDirective(this.compiler));
			this.compiler.addDirective("word", new WordDirective(this.compiler));
			
			// add some output types to compiler (more can be added)
			this.compiler.addOutput("raw", new RawOutput(this.compiler));
			this.compiler.addOutput("humanreadable", new HumanreadableOutput(this.compiler));
			this.compiler.addOutput("program", new ProgramOutput(this.compiler));
			this.compiler.addOutput("json", new JsonOutput(this.compiler));
			// all error message and warnings even infos goes through log event,
			// so needs to be listen to it.
			this.compiler.on("log", this.onLog, this);
			this.compiler.on("fatal", this.onFatalError, this);
			
			return this;
		},
		/**
		 * Compiles the text in textEl.
		 * 
		 * @returns {object}    output
		 */
		compile: function() {
			this.compiler.compile(this.inputContent);
			
			return this;
		},
		/**
		 * Writes the compiled program into a file using the specified output
		 * type.
		 * 
		 * @returns {undefined}
		 */
		write: function() {
			var output = this.compiler.generate(this.type);
			File.write(this.outputFile, output);
		},
		
		/**
		 * Occurs when a log event happens in compiler. Prints out message.
		 * 
		 * @param {object} msgData     Message data (message, and loglevel).
		 * @returns {undefined}
		 */
		onLog: function(msgData) {
			this.log(msgData.message);
		},
				
		/**
		 * Executed when a fatal error occured during compiling.
		 * 
		 * @param {string} msg        Message to be printed
		 * @throws {Error}
		 * @returns {undefined}
		 */
		onFatalError: function(msg) {
			throw new Error(msg);
		},

		/**
		 * Logs a message to the console. Can accept many arguments as strings
		 * 
		 * @param {message} [...] Unlimited amount of messages.
		 * @returns {object}  Returns self.
		 */
		log: function() {
			var i,len ;
			
			for (i = 0, len = arguments.length; i < len; i++ ) {
				console.info(arguments[i]);
			}
			return this;
		}
	};
}());


/**
 * runs the assember using command line params
 */

try {
	var config = Util.processArgs(process.argv);
	
	config = Util.apply(config, { scope: this });

	assembler.init(config);
	assembler.compile();
	assembler.write();
} catch(e) {
	console.info(e);
}