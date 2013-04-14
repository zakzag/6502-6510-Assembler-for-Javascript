/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


ASM = {
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