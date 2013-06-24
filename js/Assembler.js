/*
 * Assembler class: the object that manages click events and
 * calls methods on Compiler. Basically this is the object that holds
 * everything together.
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

ASM.Assembler = (function() {
	return {
		init: function(config) {
			for (var buttonId in config.buttons) {
				var button = config.buttons[buttonId];
				buttonEl = document.getElementById(buttonId);
				buttonEl.addEventListener("click", button.bind(this));
			}
			this.compiler = config.compiler || new ASM.Compiler({
				scope: this,
				opcodes: ASM.Opcode
			});
			
			// add all directives required for compiling (more can be added, if needed)
			this.compiler.addDirective("text", new ASM.directive.Text(this.compiler));
			this.compiler.addDirective("byte", new ASM.directive.Byte(this.compiler));
			this.compiler.addDirective("word", new ASM.directive.Word(this.compiler));
			
			// add some output types to compiler (more can be added)
			this.compiler.addOutput("raw", new ASM.output.Raw());
			this.compiler.addOutput("humanreadable", new ASM.output.HumanReadable());
			// all error message and warnings even infos goes through log event,
			// so needs to be listen to it.
			this.compiler.on("log", this.onLog, this);
			this.compiler.on("fatal", this.onFatalError, this);
			// user interface items
			this.textEl = document.getElementById(config.textId);
			this.messagesEl = document.getElementById(config.messagesId);
			this.outputEl = document.getElementById(config.outputId);
		},
		/**
		 * Compiles the text in textEl.
		 * 
		 * @returns {object}    Returns self, to make function chainable.
		 */
		compile: function() {
			this.clearMessages();
			this.clearOutput();
			
			this.compiler.compile(this.textEl.value);
			
			this.outputEl.value = this.compiler.generate("humanreadable");
			return this;
		},
		/**
		 * Clears message area.
		 * 
		 * @returns {object}    Returns self, to make function chainable.
		 */
		clearMessages: function() {
			this.messagesEl.value = "";
			
			return this;
		},
		/**
		 * Clears output area.
		 * @returns {object}    Returns self, to make function chainable.
		 */
		clearOutput: function() {
			this.outputEl.value = "";
			
			return this;
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
				
		onFatalError: function(msgData) {
			var msg = msgData.message + "   (" + msgData.text + ") in line #" + msgData.line
			this.log(msg);
			throw new Error(msg);
		},

		/**
		 * Event handler for compile button click.
		 * 
		 * @param {event} ev
		 * @returns {undefined}
		 */
		onBtnCompileClick: function(ev) {
			ev.preventDefault();
			this.compile();
		},

		onBtnSaveAsClick: function(ev) {
			console.info("save as");
			ev.preventDefault();
		},

		onBtnClearOutputClick: function(ev) {
			ev.preventDefault();
			console.info("clear output");
			this.clearOutput();
		},

		onBtnClearMessagesClick: function(ev) {
			console.info("clear messages");
			ev.preventDefault();
			this.clearMessages();
		},

		log: function() {
			for (var i= 0, len = arguments.length; i < len; i++ ) {
				this.messagesEl.value += arguments[i] + "\n";
			}
			return this;
		}
	}
})();