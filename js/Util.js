/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
Util = (function() {
	B = {
		apply: function(o, c, defaults){
			// no "this" reference for friendly out of scope calls
			if(defaults){
				B.apply(o, defaults);
			}
			if(o && c && typeof c == 'object'){
				for(var p in c){
					o[p] = c[p];
				}
			}
			return o;
		},

		extend : function(){
            // inline overrides
            var io = function(o) {
                for (var m in o) {
                    this[m] = o[m];
                }
            };
            var oc = Object.prototype.constructor;

            return function(sb, sp, overrides){
                if(typeof sp == "object"){
                    overrides = sp;
                    sp = sb;
                    sb = overrides.constructor != oc ? overrides.constructor : function(){ sp.apply(this, arguments); };
                }
                var F = function() {},
                    sbp,
                    spp = sp.prototype;

                F.prototype = spp;
                sbp = sb.prototype = new F();
                sbp.constructor = sb;
                sb.superclass = spp;

                if (spp.constructor == oc) {
                    spp.constructor=sp;
                }
                sb.override = function(o) {
                    B.override(sb, o);
                };
                sbp.superclass = sbp.supr = (function(){
                    return spp;
                });

                sbp.override = io;
                B.override(sb, overrides);

                sb.extend = function(o){ return B.extend(sb, o);};

                return sb;
            };
        }(),

		override : function(origclass, overrides){
            if (overrides) {
                var p = origclass.prototype;
                B.apply(p, overrides);
            }
        }
	};

	return B;
})();