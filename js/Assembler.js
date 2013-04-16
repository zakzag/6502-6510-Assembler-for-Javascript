/*
 * Assembler class: the big object that manages click events and
 * calls methods on Compiler according to it. Basically this is the object
 * that holds everything together.
 *
 * apply method is an exception, because we don't have any util object or
 * anything that can have tools, so we use ASM to help us.
 *
 * Later releases may have more structured form of classes and objects
 * but in the time of this phase, we don't need them at all.
 *
 * ASM is a namespace for all the objects and classes used in this project.
 * All of them is under ASM, so the compiler will be called ASM.Compiler
 *
 * ASM handles all events from the user interface, sends commands to the child
 * objects (Opcode, Compiler so far) and listens to them (using callback
 * functions). Later on it is possible to switch to Observable pattern to make it
 * be more like OOP
 */


ASM = (function() {
	var ASM = {
		apply: function(o, c, defaults){
			// no "this" reference for friendly out of scope calls
			if(defaults){
				Ext.apply(o, defaults);
			}
			if(o && c && typeof c == 'object'){
				for(var p in c){
					o[p] = c[p];
				}
			}
			return o;
		},

		init: function(config) {
			for (var buttonId in config.buttons) {
				var button = config.buttons[buttonId];
				buttonEl = document.getElementById(buttonId);
				buttonEl.addEventListener("click", button.bind(this));
			}
			this.compiler = config.compiler;
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
			console.info("compile");
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
		}
	}

	return ASM;
})();