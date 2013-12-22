/*
 * @type UtilClass: Basic functions for the assembler. Implements inheritance and
 *                  object shallow copy
 */
module.exports = (function() {
    var UtilClass = {
		/**
		 * Shallow copy 
		 * 
		 * @param {Object} o         
		 * @param {Object} c
		 * @param {Object} defaults
		 * @returns {Object}
		 */
        apply: function(o, c, defaults) {
            // no "this" reference for friendly out of scope calls
            if (defaults) {
                UtilClass.apply(o, defaults);
            }
            if (o && c && typeof c === 'object') {
                for (var p in c) {
                    o[p] = c[p];
                }
            }
            return o;
        },
        extend: function() {
            // inline overrides
            var io = function(o) {
                for (var m in o) {
                    this[m] = o[m];
                }
            };
            var oc = Object.prototype.constructor;

            return function(sb, sp, overrides) {
                if (typeof sp === "object") {
                    overrides = sp;
                    sp = sb;
                    sb = overrides.constructor !== oc ? overrides.constructor : function() {
                        sp.apply(this, arguments);
                    };
                }
                var F = function() {
                },
                        sbp,
                        spp = sp.prototype;

                F.prototype = spp;
                sbp = sb.prototype = new F();
                sbp.constructor = sb;
                sb.superclass = spp;

                if (spp.constructor === oc) {
                    spp.constructor = sp;
                }
                sb.override = function(o) {
                    UtilClass.override(sb, o);
                };
                sbp.superclass = sbp.supr = (function() {
                    return spp;
                });

                sbp.override = io;
                UtilClass.override(sb, overrides);

                sb.extend = function(o) {
                    return B.extend(sb, o);
                };

                return sb;
            };
        }(),	
        override: function(origclass, overrides) {
            if (overrides) {
                var p = origclass.prototype;
                UtilClass.apply(p, overrides);
            }
        },
		/**
		 * processes input arguments, an argument look like this:
		 * arg:value 
		 * a string (key) followed by a semicolon and another string (value)
		 * This means that only one key of the same name can exist in the list
		 * 
		 * @param {type} args          Argument list to process.
		 * @returns {object}           Key value pairs of args.
		 */
		processArgs: function(args) {
			var result = {};
			
			args.forEach(function(item) {
				var parts = item.split(":");
				result[parts[0]] = parts[1];
			});
			
			return result;
		}
    };

    return UtilClass;
})();