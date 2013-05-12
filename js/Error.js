
/** ASM Error base class for Error Classes */
ASM.Error = (function() {
	var ErrorClass = function(message, line, pos) {
		this.message = this.name + " in line #" + line + ": "+ message;
		ErrorClass.constructor.prototype.call(this, this.message);
	};
	
	ErrorClass.prototype = Error.prototype;
	
	return ErrorClass;
})();

/** Syntax Error */
ASM.Error.Syntax = function() { 
	ASM.Error.apply(this, arguments) 
};
ASM.Error.Syntax.prototype = new Error();
ASM.Error.Syntax.prototype.name = "Syntax Error";

/** Out of Range Error */
ASM.Error.OutOfRange = function() { 
	ASM.Error.apply(this, arguments) 
};
ASM.Error.OutOfRange.prototype = new Error();
ASM.Error.OutOfRange.prototype.name = "Out of Range Error";

/** Not Implemented Error */
ASM.Error.NotImplemented = function() { 
	ASM.Error.apply(this, arguments) 
};
ASM.Error.NotImplemented.prototype = new Error();
ASM.Error.NotImplemented.prototype.name = "Not Implemented Error";

/** Unknown Identifier Error */
ASM.Error.UnknownIdentifier = function() { 
	ASM.Error.apply(this, arguments) 
};
ASM.Error.UnknownIdentifier.prototype = new Error();
ASM.Error.UnknownIdentifier.prototype.name = "Unknown Identifier Error";

/** Unknown Identifier Error */
ASM.Error.Invalid = function() { 
	ASM.Error.apply(this, arguments) 
};
ASM.Error.Invalid.prototype = new Error();
ASM.Error.Invalid.prototype.name = "Invalid Expression Error";


/** Duplicate Identifier Error */
ASM.Error.DuplicateIdentifier = function() { 
	ASM.Error.apply(this, arguments) 
};
ASM.Error.DuplicateIdentifier.prototype = new Error();
ASM.Error.DuplicateIdentifier.prototype.name = "Duplicate Identifier Error";
