/*can-compute@3.1.0-pre.10#single-reference*/
define(function (require, exports, module) {
    (function (global) {
        var canReflect = require('can-reflect/reflections/get-set');
        var CID = require('can-cid');
        var singleReference;
        singleReference = {
            set: function (obj, key, value, extraKey) {
                canReflect.set(obj, extraKey ? CID(key) + ':' + extraKey : CID(key), value);
            },
            getAndDelete: function (obj, key, extraKey) {
                var cid = extraKey ? CID(key) + ':' + extraKey : CID(key);
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