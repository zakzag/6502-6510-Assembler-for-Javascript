
/** ASM Error base class for Error Classes */
ASM.Error = (function() {
	var ErrorClass = function(message, line, pos) {
		this.message = this.name + " in line #" + line + ": "+ message;
		ErrorClass.constructor.prototype.call(this, this.message);
	};
	
	ErrorClass.prototype = Error.prototype;
	
	return ErrorClass;
})();

ASM.error = {};
/** Syntax Error */
ASM.error.Syntax = function() { 
	ASM.Error.apply(this, arguments); 
};
ASM.error.Syntax.prototype = new ASM.Error();
ASM.error.Syntax.prototype.name = "Syntax Error";

/** Out of Range Error */
ASM.error.OutOfRange = function() { 
	ASM.Error.apply(this, arguments);
};
ASM.error.OutOfRange.prototype = new ASM.Error();
ASM.error.OutOfRange.prototype.name = "Out of Range Error";

/** Not Implemented Error */
ASM.error.NotImplemented = function() { 
	ASM.Error.apply(this, arguments);
};
ASM.error.NotImplemented.prototype = new ASM.Error();
ASM.error.NotImplemented.prototype.name = "Not Implemented Error";

/** Unknown Identifier Error */
ASM.error.UnknownIdentifier = function() { 
	ASM.Error.apply(this, arguments); 
};
ASM.error.UnknownIdentifier.prototype = new ASM.Error();
ASM.error.UnknownIdentifier.prototype.name = "Unknown Identifier Error";

/** Unknown Identifier Error */
ASM.error.Invalid = function() { 
	ASM.Error.apply(this, arguments);
};
ASM.error.Invalid.prototype = new ASM.Error();
ASM.error.Invalid.prototype.name = "Invalid Expression Error";


/** Duplicate Identifier Error */
ASM.error.DuplicateIdentifier = function() { 
	ASM.Error.apply(this, arguments); 
};
ASM.error.DuplicateIdentifier.prototype = new ASM.Error();
ASM.error.DuplicateIdentifier.prototype.name = "Duplicate Identifier Error";

ASM.error.OutOfBounds = function() {
	ASM.Error.apply(this, arguments);
};

ASM.error.OutOfBounds.prototype = new ASM.Error();
ASM.error.OutOfBounds.prototype.name = "Argument out of bounds";