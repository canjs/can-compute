var canReflect = require('can-reflect/reflections/get-set/get-set');
var CID = require("can-cid");




var singleReference;

// weak maps are slow
/* if(typeof WeakMap !== "undefined") {
	var globalMap = new WeakMap();

	singleReference = {
		set: function(obj, key, value){
			var localMap = globalMap.get(obj);
			if( !localMap ) {
				globalMap.set(obj, localMap = new WeakMap());
			}
			localMap.set(key, value);
		},
		getAndDelete: function(obj, key){
			return globalMap.get(obj).get(key);
		},
		references: globalMap
	};
} else {*/
	singleReference = {
		// obj is a function ... we need to place `value` on it so we can retreive it
		// we can't use a global map
		set: function(obj, key, value, extraKey){
			// check if it has a single reference map
			canReflect.set(obj, extraKey ? CID(key) + ":" + extraKey : CID(key), value);
		},
		getAndDelete: function(obj, key, extraKey){
			var cid = extraKey ? CID(key) + ":" + extraKey : CID(key);
			var value = canReflect.get(obj, cid);
			canReflect.delete(obj, cid);
			return value;
		}
	};
/*}*/

module.exports = singleReference;
