/*can-compute@3.0.0-pre.6#can-compute*/
define(function (require, exports, module) {
    require('can-event');
    require('can-event/batch');
    var Compute = require('./proto-compute');
    var CID = require('can-util/js/cid');
    var namespace = require('can-util/namespace');
    var COMPUTE = function (getterSetter, context, eventName, bindOnce) {
        var internalCompute = new Compute(getterSetter, context, eventName, bindOnce);
        var addEventListener = internalCompute.addEventListener;
        var removeEventListener = internalCompute.removeEventListener;
        var compute = function (val) {
            if (arguments.length) {
                return internalCompute.set(val);
            }
            return internalCompute.get();
        };
        var cid = CID(compute, 'compute');
        var handlerKey = '__handler' + cid;
        compute.bind = compute.addEventListener = function (ev, handler) {
            var computeHandler = handler && handler[handlerKey];
            if (handler && !computeHandler) {
                computeHandler = handler[handlerKey] = function () {
                    handler.apply(compute, arguments);
                };
            }
            return addEventListener.call(internalCompute, ev, computeHandler);
        };
        compute.unbind = compute.removeEventListener = function (ev, handler) {
            var computeHandler = handler && handler[handlerKey];
            if (computeHandler) {
                delete handler[handlerKey];
                return internalCompute.removeEventListener(ev, computeHandler);
            }
            return removeEventListener.apply(internalCompute, arguments);
        };
        compute.isComputed = internalCompute.isComputed;
        compute.clone = function (ctx) {
            if (typeof getterSetter === 'function') {
                context = ctx;
            }
            return COMPUTE(getterSetter, context, ctx, bindOnce);
        };
        compute.computeInstance = internalCompute;
        return compute;
    };
    COMPUTE.truthy = function (compute) {
        return COMPUTE(function () {
            var res = compute();
            if (typeof res === 'function') {
                res = res();
            }
            return !!res;
        });
    };
    COMPUTE.async = function (initialValue, asyncComputer, context) {
        return COMPUTE(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    COMPUTE.temporarilyBind = Compute.temporarilyBind;
    module.exports = namespace.compute = COMPUTE;
});