/* jshint maxdepth:7*/

// # can.compute
//
// `can.compute` allows the creation of observable values in different forms.
// This module is now just a facade around [proto_compute.js](proto_compute.html).
// `proto_compute.js` provides `can.Compute` as a constructor function where this file,
// `compute.js` wraps an instance of a `can.Compute` with a function.
//
// Other files:
// - [get_value_and_bind.js](get_value_and_bind.js) provides the low-level utility for observing functions.
// - [read.js](read.html) provides a helper that read properties and values in an observable way.


require('can-event');
require('can-event/batch/');

var Compute = require('./proto-compute');
var CID = require('can-util/js/cid/');
var namespace = require('can-util/namespace');

// The `can.compute` generator function.

var COMPUTE = function (getterSetter, context, eventName, bindOnce) {
	// Create an internal `can.Compute`.
	var internalCompute = new Compute(getterSetter, context, eventName, bindOnce);
	// The "compute" function that calls compute instance's get or set function.
	var addEventListener = internalCompute.addEventListener;
	var removeEventListener = internalCompute.removeEventListener;
	var compute = function(val) {
		if(arguments.length) {
			return internalCompute.set(val);
		}

		return internalCompute.get();
	};
	var cid = CID(compute, 'compute');
	var handlerKey = '__handler' + cid;

	compute.on = compute.bind = compute.addEventListener = function(ev, handler) {
		var computeHandler = handler && handler[handlerKey];
		if(handler && !computeHandler) {
			computeHandler = handler[handlerKey] = function() {
				handler.apply(compute, arguments);
			};
		}

		return addEventListener.call(internalCompute, ev, computeHandler);
	};
	compute.off = compute.unbind = compute.removeEventListener = function(ev, handler) {
		var computeHandler = handler && handler[handlerKey];
		if(computeHandler) {
			delete handler[handlerKey];
			return internalCompute.removeEventListener(ev, computeHandler);
		}
		return removeEventListener.apply(internalCompute, arguments);
	};
	compute.isComputed = internalCompute.isComputed;
	compute.clone = function(ctx) {
		if(typeof getterSetter === 'function') {
			context = ctx;
		}
		return COMPUTE(getterSetter, context, ctx, bindOnce);
	};

	compute.computeInstance = internalCompute;

	return compute;
};

// ## Helpers

// ### truthy
// Wraps a compute with another compute that only changes when
// the wrapped compute's `truthiness` changes.
COMPUTE.truthy = function (compute) {
	return COMPUTE(function () {
		var res = compute();
		if (typeof res === 'function') {
			res = res();
		}
		return !!res;
	});
};

// ### async
// A simple helper that makes an async compute a bit easier.
COMPUTE.async = function(initialValue, asyncComputer, context){
	return COMPUTE(initialValue, {
		fn: asyncComputer,
		context: context
	});
};

// ### compatability
// Setting methods that should not be around in 3.0.
COMPUTE.temporarilyBind = Compute.temporarilyBind;

module.exports = namespace.compute = COMPUTE;
