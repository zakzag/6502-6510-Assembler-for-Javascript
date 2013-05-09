
ASM.Error = (function() {
	var ErrorClass = function(message, line, pos) {
		this.message = this.name + " in line #" + line + ": "+ message;
		ErrorClass.constructor.prototype.call(this, this.message);
	};
	
	ErrorClass.prototype = Error.prototype;
	
	return ErrorClass;
})();

ASM.Error.Syntax = function() {};
ASM.Error.Syntax.prototype = Error;
