var compute = require('can-compute');
var QUnit = require('steal-qunit');
require('can-event/batch/batch');
var canAsync = require("can-event/async/async");
//require('./read_test');

QUnit.module('can-compute async',{
	setup: function(){
		canAsync.async();
	},
	teardown: function(){
		canAsync.sync();
	}
});

QUnit.asyncTest('async basics', 2, function () {
	var canAsync = require("can-event/async/async");
	canAsync.async();

	var first = compute("Justin");
	var last = compute("Meyer");

	var fullName = compute(function(){
		return first() + " " + last();
	});

	fullName.on("change", function(ev, newVal, oldVal){
		QUnit.equal( newVal,  "Payal Shah", "newVal");
		QUnit.equal( oldVal, "Justin Meyer", "oldVal");
		QUnit.start();
	});

	first("Payal");
	last("Shah");
});

QUnit.asyncTest('async can immediately read', 4, function () {
	var canAsync = require("can-event/async/async");
	canAsync.async();

	var compute = require("can-compute");

	var first = compute("Justin");
	var last = compute("Meyer");

	var fullName = compute(function(){
		return first() + " " + last();
	});
	var firedEvents = false;
	fullName.on("change", function(ev, newVal, oldVal){
		QUnit.equal( newVal,  "Payal Shah", "change newVal");
		QUnit.equal( oldVal, "Justin Meyer", "change oldVal");
		firedEvents = true;
		QUnit.start();
	});

	first("Payal");
	last("Shah");

	QUnit.equal( fullName(),  "Payal Shah");
	QUnit.ok(firedEvents, "fired events");
});

test("setting compute.async with a observable dependency gets a new value and can re-compute", 4, function(){
	// this is needed for define with a set and get.
	var c = compute(1);
	var add;

	var async = compute.async(1, function(curVal){
		add = curVal;
		return c()+add;
	});


	equal( async(), 2, "can read unbound");

	async.bind("change", function(ev, newVal, oldVal){
		equal(newVal, 3, "change new val");
		equal(oldVal, 2, "change old val");
	});


	async(2);

	equal( async(), 3, "can read unbound");
});

test('compute.async getter has correct when length === 1', function(){
	var m = {};

	var getterCompute = compute.async(false, function (singleArg) {
		equal(this, m, 'getter has the right context');
	}, m);

	getterCompute.bind('change', function(){});
});

