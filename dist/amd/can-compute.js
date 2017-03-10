/*can-compute@3.0.6#can-compute*/
define(function (require, exports, module) {
    require('can-event');
    require('can-event/batch');
    var Compute = require('./proto-compute');
    var CID = require('can-cid');
    var namespace = require('can-namespace');
    var addEventListener = function (ev, handler) {
        var compute = this;
        var computeHandler = handler && handler[compute.handlerKey];
        if (handler && !computeHandler) {
            computeHandler = handler[compute.handlerKey] = function () {
                handler.apply(compute, arguments);
            };
        }
        return compute.computeInstance.addEventListener(ev, computeHandler);
    };
    var removeEventListener = function (ev, handler) {
        var compute = this;
        var computeHandler = handler && handler[compute.handlerKey];
        if (computeHandler) {
            delete handler[compute.handlerKey];
            return compute.computeInstance.removeEventListener(ev, computeHandler);
        }
        return compute.computeInstance.removeEventListener.apply(compute.computeInstance, arguments);
    };
    var COMPUTE = function (getterSetter, context, eventName, bindOnce) {
        function compute(val) {
            if (arguments.length) {
                return compute.computeInstance.set(val);
            }
            return compute.computeInstance.get();
        }
        var cid = CID(compute, 'compute');
        compute.computeInstance = new Compute(getterSetter, context, eventName, bindOnce);
        compute.handlerKey = '__handler' + cid;
        compute.on = compute.bind = compute.addEventListener = addEventListener;
        compute.off = compute.unbind = compute.removeEventListener = removeEventListener;
        compute.isComputed = compute.computeInstance.isComputed;
        compute.clone = function (ctx) {
            if (typeof getterSetter === 'function') {
                context = ctx;
            }
            return COMPUTE(getterSetter, context, ctx, bindOnce);
        };
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