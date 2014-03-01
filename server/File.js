/*
 * File class can read file content into a string and write something into a file.
 * 
 * @class File  singleton class
 * @requires Util
 * @requires fs
 */
var Util = require("./Util");
var fs = require('fs');

module.exports = (function() {
	return {
		/**
		 * Reads a file defined by filename and returns its content as a text.
		 * Filename must be an utf-8 string.
		 * 
		 * @public
		 * @param {string} filename    Path of the file.
		 * @returns {string}      File content as a string.
		 */
		getAsText: function(filename) {
			return fs.readFileSync(filename, 'utf-8');
		},
		/**
		 * Writes a string or bytes into a file. 
		 * 
		 * @public
		 * @param {string} filename        Name of the file.
		 * @param {string|Buffer} content  Content to write.
		 * @returns {undefined}
		 */
		write: function(filename, content) {
			if (typeof content === "string") {
				fs.writeFileSync(filename, content);
			} else {
				var buffer = new Buffer(content);
				var file = fs.openSync(filename, 'w');
				
				fs.write(file, buffer, 0, buffer.length);
			}
		}
	};
})();