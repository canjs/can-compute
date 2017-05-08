/*can-compute@3.1.0-pre.2#single-reference*/
define(function (require, exports, module) {
    (function (global) {
        var canReflect = require('can-reflect/reflections/get-set');
        var CID = require('can-cid');
        var singleReference;
        singleReference = {
            set: function (obj, key, value) {
                canReflect.set(obj, CID(key), value);
            },
            getAndDelete: function (obj, key) {
                var cid = CID(key);
                var value = canReflect.get(obj, cid);
                canReflect.delete(obj, cid);
                return value;
            }
        };
        module.exports = singleReference;
    }(function () {
        return this;
    }()));
});