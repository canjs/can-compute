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
require('can-event/batch/batch');

var Compute = require('./proto-compute');
var CID = require('can-cid');
var namespace = require('can-namespace');

// The `can.compute` generator function.


var addEventListener = function(ev, handler){
	var compute = this;
	var computeHandler = handler && handler[compute.handlerKey];
	if(handler && !computeHandler) {
		computeHandler = handler[compute.handlerKey] = function() {
			handler.apply(compute, arguments);
		};
	}

	return compute.computeInstance.addEventListener(ev, computeHandler);
};

var removeEventListener = function(ev, handler){
	var compute = this;

	var computeHandler = handler && handler[compute.handlerKey];

	if(computeHandler) {
		delete handler[compute.handlerKey];
		return compute.computeInstance.removeEventListener(ev, computeHandler);
	}
	return compute.computeInstance.removeEventListener.apply(compute.computeInstance, arguments);
};


var COMPUTE = function (getterSetter, context, eventName, bindOnce) {

	function compute(val) {
		if(arguments.length) {
			return compute.computeInstance.set(val);
		}

		return compute.computeInstance.get();
	}
	var cid = CID(compute, 'compute');

	// Create an internal `can.Compute`.
	compute.computeInstance = new Compute(getterSetter, context, eventName, bindOnce);

	compute.handlerKey = '__handler' + cid;
	compute.on = compute.bind = compute.addEventListener = addEventListener;
	compute.off = compute.unbind = compute.removeEventListener = removeEventListener;

	compute.isComputed = compute.computeInstance.isComputed;

	compute.clone = function(ctx) {
		if(typeof getterSetter === 'function') {
			context = ctx;
		}
		return COMPUTE(getterSetter, context, ctx, bindOnce);
	};

	return compute;
};

// ## Helpers

// ### truthy
// Wraps a compute with another compute that only changes when
// the wrapped compute's `truthiness` changes.
COMPUTE.truthy = function (compute) {
	return COMPUTE(function () {
		var res = compute();
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
