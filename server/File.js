/*
 * File class can read file content into a string and write something into a file.
 * 
 * @class ASM.File / base class for directives
 */
var Util = require("./Util");
var fs = require('fs');

module.exports = (function() {
	return {
		getAsText: function(filename) {
			return fs.readFileSync(filename, 'utf-8');
		},
		write: function(filename, content) {
			if (typeof content === "string") {
				fs.writeFileSync(filename, content);
			} else {
				var buffer = new Buffer(content);
				var file = fs.openSync(filename, 'w');
				
				fs.write(file, buffer, 0, buffer.length);
			}
		},
		
		onError: function(err) {
			throw err;
		}
	};
})();