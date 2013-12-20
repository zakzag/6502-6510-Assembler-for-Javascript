/**
 * usage: 
 * node asm6502.js i:<inputfile> o:<outputfile> t:<outputmode>
 * 
 */
var Compiler = require("./Compiler");
var Opcode = require("./Opcode");
var Util = require("./Util");

var TextDirective = require("./directive/Text");
var ByteDirective = require("./directive/Byte");
var WordDirective = require("./directive/Word");

var Output = require("./Output");
var RawOutput = require("./output/Raw");
var HumanreadableOutput = require("./output/Humanreadable");
var fs = require('fs');
var util = require('util');

util.puts("6502/6510 Assember for Node.js V0.1.0\n\n");
/*
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
 */
assembler = (function() {
	var DEFAULT_CONFIG = {
		i: undefined,
		o: undefined,
		t: "raw"
	};
	
	return {
		inputFile: undefined,
		outputFile: undefined,
		inputContent: "",
		init: function(config) {
			this.compiler = config.compiler || new Compiler({
				scope: this,
				opcodes: Opcode.Opcode,
				outputMode: config.outputMode || "raw"
			});
			
			if(!config.inputFile) {
				throw new Error("You must specify an input file")
			}
			
			if(!config.outputFile) {
				throw new Error("You must specify an output file")
			}
			
			this.inputFile = config.inputFile;
			fs.readFile(config.inputFile, 'utf-8', (function(err, data) {
				if (err) { throw err; };
				this.inputContent = data;
				config.callback instanceof Function && config.callback.call(config.scope, data);
			}).bind(this));
			
			// add all directives required for compiling (more can be added, if needed)
			this.compiler.addDirective("text", new TextDirective(this.compiler));
			this.compiler.addDirective("byte", new ByteDirective(this.compiler));
			this.compiler.addDirective("word", new WordDirective(this.compiler));
			
			// add some output types to compiler (more can be added)
			this.compiler.addOutput("raw", new RawOutput(this.compiler));
			this.compiler.addOutput("humanreadable", new HumanreadableOutput(this.compiler));
			// all error message and warnings even infos goes through log event,
			// so needs to be listen to it.
			this.compiler.on("log", this.onLog, this);
			this.compiler.on("fatal", this.onFatalError, this);
		},
		/**
		 * Compiles the text in textEl.
		 * 
		 * @returns {object}    output
		 */
		compile: function() {
			this.compiler.compile(this.inputContent);
			
			return this.compiler.generate("raw");
		},
		
		/**
		 * Occurs when a log event happens in compiler. Prints out message
		 * 
		 * @param {object} msgData     Message data (message, and loglevel).
		 * @returns {undefined}
		 */
		onLog: function(msgData) {
			this.log(msgData.message);
		},
				
		onFatalError: function(msg) {
			throw new Error(msg);
		},

		log: function() {
			for (var i= 0, len = arguments.length; i < len; i++ ) {
				console.info(arguments[i]);
			}
			return this;
		}
	};
})();


/**
 * runs the assember using command line params
 */

//try {
	var config = Util.processArgs(process.argv);
	
	assembler.init({
		inputFile: config.i || "",
		outputFile: config.o || "",
		outputMode: config.t || "raw",
		scope: this,
		callback: function() {
			try {
				util.puts(assembler.compile());
				
			} catch(e) {
				console.info(e);
			}
		}
	});
//} catch(e) {
//	console.info(e)
//}