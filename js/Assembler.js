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
				messagesCb: this.onMessage,
				scope: this
			});
			this.textEl = document.getElementById(config.textId);
			this.messagesEl = document.getElementById(config.messagesId);
			this.outputEl = document.getElementById(config.outputId);
		},

		compile: function() {
			this.compiler.compile(this.textEl.value);
		},

		clearMessages: function() {
			this.messagesEl.value = "";
		},

		clearOutput: function() {
			this.outputEl.value = "";
		},

		onBtnCompileClick: function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
			this.compile();
		},

		onBtnSaveAsClick: function(ev) {
			console.info("save as");
		},

		onBtnClearOutputClick: function(ev) {
			console.info("clear output");
			this.clearOutput();
		},

		onBtnClearMessagesClick: function(ev) {
			console.info("clear messages");
			this.clearMessages();
		},

		onMessage: function(msg) {
			this.messagesEl.value += this.messagesEl.value + "\n"+ msg;
		},
				
		log: function() {
			var fn = this.messagesCb ? this.messagesCb.bind(this.scope) : console.info;
			for (var i= 0, len = arguments.length; i < len; i++ ) {
				fn(arguments[i]);
			}
		}
	}
})();