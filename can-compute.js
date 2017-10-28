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



var CID = require('can-cid');
var namespace = require('can-namespace');
var singleReference = require("can-util/js/single-reference/single-reference");

var canReflect = require('can-reflect/reflections/get-set/get-set');
var canSymbol = require('can-symbol');
var makeCompute = require("./make-compute");


var canOnValueSymbol = canSymbol.for("can.onValue"),
	canOffValueSymbol = canSymbol.for("can.offValue"),
	canGetValue = canSymbol.for("can.getValue"),
	canSetValue = canSymbol.for("can.setValue"),
	isValueLike = canSymbol.for("can.isValueLike"),
	isMapLike = canSymbol.for("can.isMapLike"),
	isListLike = canSymbol.for("can.isListLike"),
	isFunctionLike = canSymbol.for("can.isFunctionLike"),
	canValueHasDependencies = canSymbol.for("can.valueHasDependencies"),
	canGetValueDependencies = canSymbol.for("can.getValueDependencies");

// The `can.compute` generator function.
var addEventListener = function(ev, handler){
	var compute = this;
	var translationHandler;
	if(handler){
		translationHandler = function() {
		   handler.apply(compute, arguments);
	   };
	   singleReference.set(handler, this, translationHandler);
	}
	return compute.computeInstance.addEventListener(ev, translationHandler);
};

var removeEventListener = function(ev, handler){
		var args = [];
		if (typeof ev !== 'undefined') {
			args.push(ev);
			if (typeof handler !== 'undefined') {
				args.push(handler);
			}
		}
		return this.computeInstance.removeEventListener.apply(this.computeInstance, args);
};
var onValue = function(handler){
		return this.computeInstance[canOnValueSymbol](handler);
	},
	offValue = function(handler){
		return this.computeInstance[canOffValueSymbol](handler);
	},
	getValue = function(){
		return this.computeInstance.get();
	},
	setValue = function(value){
		return this.computeInstance.set(value);
	},
	hasDependencies = function(){
		return this.computeInstance.hasDependencies;
	},
	getDependencies = function() {
		return this.computeInstance[canGetValueDependencies]();
	};

var SimpleObservable = require("can-simple-observable");
var AsyncObservable = require("can-simple-observable/async/async");
var SetterObservable = require("can-simple-observable/setter/setter");
var SettableObservable = require("can-simple-observable/settable/settable");
var COMPUTE = function (getterSetter, context, eventName, bindOnce) {
	var args = [];

	for(var i = 0, arglen = arguments.length; i < arglen; i++) {
		args[i] = arguments[i];
	}

	var contextType = typeof args[1];

	if (typeof args[0] === 'function') {
		// Getter/Setter functional computes.
		// `new can.Compute(function(){ ... })`
		var fn = args[0].bind(args[1]);
		return makeCompute(new SetterObservable(fn) );
	} else if (args[1] !== undefined) {
		if (contextType === 'string' || contextType === 'number') {
			// Property computes.
			// `new can.Compute(object, propertyName[, eventName])`
			return makeCompute(new PropertyObservable(args[0], args[1], args[2]));

		} else if(contextType === 'function') {
			// Setter computes.
			// `new can.Compute(initialValue, function(newValue){ ... })`
			return makeCompute(new SettableObservable(args[0], args[1].bind(args[2]));
		} else {

			if(args[1] && args[1].fn) {
				// Async computes.
				this._setupAsyncCompute(args[0], args[1]);
			} else {
				// Settings computes.
				//`new can.Compute(initialValue, {on, off, get, set})`
				// this._setupSettings(args[0], args[1]);
				throw new Error("Settings based computes are no longer supported. Implement onValue, offValue, getValue and setValue yourself");
			}

		}
	} else {
		// Simple value computes.
		// `new can.Compute(initialValue)`
		return new SimpleObservable(args[0])
	}


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
