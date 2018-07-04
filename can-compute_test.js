require("./proto-compute_test");
var compute = require('can-compute');
var QUnit = require('steal-qunit');
var ObservationRecorder = require("can-observation-recorder");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var eventQueue = require("can-event-queue/map/map");
var queues = require("can-queues");
var domEvents = require("can-dom-events");

var metaSymbol = canSymbol.for("can.meta");
var domDispatch = domEvents.dispatch;

QUnit.module('can/compute');
test('single value compute', function () {
	var num = compute(1);
	num.on('change', function (ev, newVal, oldVal) {
		equal(newVal, 2, 'newVal');
		equal(oldVal, 1, 'oldVal');
	});
	num(2);
});
test('inner computes values are not bound to', function () {
	var num = compute(1);
	var outer = compute(function() {
		var inner = compute(function() {
			return num() + 1;
		});
		return 2 * inner();
	});

	var handler = function () {};
	outer.on('change', handler);
	// We do a timeout because we temporarily bind on num so that we can use its cached value.
	stop();
	setTimeout(function () {

		equal(num.computeInstance[metaSymbol].handlers.get([]).length, 1, 'inner compute only bound once');
		equal(outer.computeInstance[metaSymbol].handlers.get([]).length, 1, 'outer compute only bound once');
		start();
	}, 50);
});

test('compute.truthy', function () {
	var result = 0;
	var numValue;
	var num = compute(numValue = 3);
	var truthy = compute.truthy(num);
	var tester = compute(function () {
		if (truthy()) {
			return ++result;
		} else {
			return ++result;
		}
	});
	tester.addEventListener('change', function (ev, newVal, oldVal) {
		if (num() === 0) {
			equal(newVal, 2, '2 is the new val');
		} else if (num() === -1) {
			equal(newVal, 3, '3 is the new val');
		} else {
			ok(false, 'change should not be called');
		}
	});
	equal(tester(), 1, 'on bind, we call tester once');
	num(numValue = 2);
	num(numValue = 1);
	num(numValue = 0);
	num(numValue = -1);
});
test('a binding compute does not double read', function () {
	var sourceAge = 30,
		timesComputeIsCalled = 0;
	var age = compute(function (newVal) {
		timesComputeIsCalled++;
		if (timesComputeIsCalled === 1) {
			ok(true, 'reading age to get value');
		} else if (timesComputeIsCalled === 2) {
			equal(newVal, 31, 'the second time should be an update');
		} else if (timesComputeIsCalled === 3) {
			ok(true, 'called after set to get the value');
		} else {
			ok(false, 'You\'ve called the callback ' + timesComputeIsCalled + ' times');
		}
		if (arguments.length) {
			sourceAge = newVal;
		} else {
			return sourceAge;
		}
	});
	var info = compute(function () {
		return 'I am ' + age();
	});
	var k = function () {};
	info.bind('change', k);
	equal(info(), 'I am 30');
	age(31);
	equal(info(), 'I am 31');
});
test('cloning a setter compute (#547)', function () {
	var name = compute('', function (newVal) {
		return this.txt + newVal;
	});
	var cloned = name.clone({
		txt: '.'
	});
	cloned('-');
	equal(cloned(), '.-');
});

test('compute updated method uses get and old value (#732)', function () {
	expect(9);
	var input = {
		value: 1
	};
	var value = compute('', {
		get: function () {
			return input.value;
		},
		set: function (newVal) {
			input.value = newVal;
		},
		on: function (update) {
			input.onchange = update;
		},
		off: function () {
			delete input.onchange;
		}
	});
	equal(value(), 1, 'original value');
	ok(!input.onchange, 'nothing bound');
	value(2);
	equal(value(), 2, 'updated value');
	equal(input.value, 2, 'updated input.value');


	function handler(ev, newVal, oldVal) {
		equal(newVal, 3, 'newVal');
		equal(oldVal, 2, 'oldVal');
		value.unbind('change',handler);
	}
	value.bind('change', handler);
	ok(input.onchange, 'binding to onchange');


	input.value = 3;
	input.onchange({});

	ok(!input.onchange, 'removed binding');
	equal(value(), 3);
});

test("a compute updated by source changes within a batch is part of that batch", function(){

	var computeA = compute("a");
	var computeB = compute("b");

	var combined1 = compute(function combined1(){

		return computeA()+" "+computeB();

	});

	var combined2 = compute(function combined2(){

		return computeA()+" "+computeB();

	});

	var combo = compute(function combo(){
		return combined1()+" "+combined2();
	});

	var callbacks = 0;
	combo.bind("change", function(){
		if(callbacks === 0){
			ok(true, "called change once");
		} else {
			ok(false, "called change multiple times");
		}
		callbacks++;
	});

	queues.batch.start();
	computeA("A");
	computeB("B");
	queues.batch.stop();
});

test("compute.async can be like a normal getter", function(){
	var first = compute("Justin"),
		last = compute("Meyer"),
		fullName = compute.async("", function(){
			return first()+" "+last();
		});

	equal(fullName(), "Justin Meyer");
});

test("compute.async operate on single value", function(){

	var a = compute(1);
	var b = compute(2);

	var obj = compute.async({}, function( curVal ){
		if(a()) {
			curVal.a = a();
		} else {
			delete curVal.a;
		}
		if(b()) {
			curVal.b = b();
		} else {
			delete curVal.b;
		}
		return curVal;
	});

	obj.bind("change", function(){});

	deepEqual( obj(), {a: 1, b: 2}, "object has all properties" );

	a(0);

	deepEqual( obj(), {b: 2}, "removed a" );

	b(0);

	deepEqual( obj(), {}, "removed b" );

});

test("compute.async async changing value", function(){

	var a = compute(1);
	var b = compute(2);

	var async = compute.async(undefined,function( curVal, setVal ){

		if(a()) {
			setTimeout(function(){
				setVal("a");
			},10);
		} else if(b()) {
			setTimeout(function(){
				setVal("b");
			},10);
		} else {
			return null;
		}
	});

	var changeArgs = [
		{newVal: "a", oldVal: undefined, run: function(){ a(0); } },
		{newVal: "b", oldVal: "a", run: function(){ b(0); }},
		{newVal: null, oldVal: "b", run: function(){ start(); }}
	],
		changeNum = 0;

	stop();


	async.bind("change", function(ev, newVal, oldVal){
		var data = changeArgs[changeNum++];
		equal( newVal, data.newVal, "newVal is correct" );
		equal( oldVal, data.oldVal, "oldVal is correct" );

		setTimeout(data.run, 10);

	});



});

test("compute.async read without binding", function(){

	var source = compute(1);

	var async = compute.async([],function( curVal, setVal ){
		curVal.push(source());
		return curVal;
	});

	ok(async(), "calling async worked");



});

test("bug with nested computes and batch ordering (#1519)", function(){

	var root = compute('a');

	var isA = compute(function(){
		return root() ==='a';
	});

	var isB = compute(function(){
		return root() === 'b';
	});

	var combined = compute(function(){
		var valA = isA(),
			valB = isB();

		return valA || valB;
	});

	equal(combined(), true);

	combined.bind('change', function(){ });



	queues.batch.start();
	root('b');
	queues.batch.stop();

	equal(combined(), true);
	//equal(other(), 2);
});

test('compute change handler context is set to the function not compute', function() {
	var comp = compute(null);

	comp.bind('change', function() {
		equal(typeof this, 'function');
	});

	comp('test');
});

test('Calling .unbind() on un-bound compute does not throw an error', function () {
	var count =  compute(0);
	count.unbind('change');
	ok(true, 'No error was thrown');
});


test("dependent computes update in the right order (2093)", function() {

	var root = compute('a'),
		childB = compute(function() {
			return root();
		}),
		combine = compute(function() {
			return root() + childB();
		});

	combine.bind("change", function(ev, newVal) {
		equal(newVal, "bb", "concat changed");
	});
	root('b');
});

test("dependent computes update in the right order with a batch (#2093)", function() {

	// so the problem is that `child` then `combine` happens.
	// without a batch, child change fires before `combine`, firing `grandChild`, which
	// then triggers `combine`.


	// the goal should be for
	var root = compute('a'),
		child = compute(function() {
			return root();
		}),
		child2 = compute(function(){
			return root();
		}),
		grandChild = compute(function(){
			return child();
		}),
		combine = compute(function() {
			return child2()+grandChild();
		});

	/*canLog.log("root", root.computeInstance._cid,
		"child", child.computeInstance._cid,
		"grandChild", grandChild.computeInstance._cid,
		"combine", combine.computeInstance._cid);*/

	combine.bind("change", function(ev, newVal) {
		equal(newVal, "bb", "concat changed");
	});

	/*root.bind("change", function(ev, newVal){
		canLog.log("root change", ev.batchNum)
	});
	child.bind("change", function(ev, newVal){
		canLog.log("child change", ev.batchNum)
	});
	grandChild.bind("change", function(ev, newVal){
		canLog.log("grandChild change", ev.batchNum)
	});*/

	queues.batch.start();
	root('b');
	queues.batch.stop();
});

test("bug with nested computes and batch ordering (#1519)", function(){

	var root = compute('a');

	var isA = compute(function(){
		return root() ==='a';
	});

	var isB = compute(function(){
		return root() === 'b';
	});

	var combined = compute(function(){
		var valA = isA(),
			valB = isB();

		return valA || valB;
	});

	equal(combined(), true);

	combined.bind('change', function(){ });



	queues.batch.start();
	root('b');
	queues.batch.stop();

	equal(combined(), true);
	//equal(other(), 2);
});

test("binding, unbinding, and rebinding works after a timeout (#2095)", function(){
	var root = compute(1),
		derived = compute(function(){
			return root();
		});

	var change = function(){};
	derived.bind("change", change);
	derived.unbind("change", change);

	stop();
	setTimeout(function(){
		derived.bind("change", function(ev, newVal, oldVal){
			equal(newVal, 2, "updated");
			start();
		});
		root(2);
	},10);

});

test("ObservationRecorder.isRecording observes doesn't understand ObservationRecorder.ignore (#2099)", function(){
	expect(0);
	var c = compute(1);
	c.computeInstance.bind = function() {
		ok(false);
	};

	var outer = compute(function(){
		ObservationRecorder.ignore(function(){
			c();
		})();
	});

	outer.bind("change", function(){});
});

test("handles missing update order items (#2121)",function(){
	var root1 = compute("root1"),
		child1 = compute(function(){
			return root1();
		}),
		root2 = compute("root2"),
		child2 = compute(function(){
			return root2();
		}),
		gc2 = compute(function(){
			return child2();
		}),
		res = compute(function(){
			return child1() + gc2();
		});

	res.bind("change", function(ev, newVal){
		equal(newVal, "ROOT1root2");
	});

	queues.batch.start();
	root1("ROOT1");
	queues.batch.stop();

});

test("compute should not fire event when NaN is set multiple times #2128", function() {
	var c = compute(NaN);

	compute.bind("change", function() {
		ok(false, "change event should not be fired");
	});

	ok(isNaN(c()));
	c(NaN);
});

test("eventQueue.afterPreviousEvents firing too late (#2198)", function(){


	var compute1 = compute("a"),
		compute2 = compute("b");

	var derived = compute(function() {
		return compute1().toUpperCase();
	});

	derived.bind("change", function() {
		var afterPrevious = false;

		compute2.bind("change", function() {
			ok(afterPrevious, "after previous should have fired so we would respond to this event");
		});

		queues.batch.start();
		queues.batch.stop();

		// we should get this callback before we are notified of the change
		eventQueue.afterPreviousEvents(function() {
			afterPrevious = true;
		});

		compute2("c");
	});

	queues.batch.start();
	compute1("x");
	queues.batch.stop();
});

test("Async getter causes infinite loop (#28)", function(){
	var changeCount = 0;
	var idCompute = compute(1);
	stop();

	var comp = compute.async(undefined, function(last, resolve) {
		var id = idCompute();

		setTimeout(function(){
			resolve(changeCount + '|' + id);
		},1);

		resolve(changeCount + '|' + id);
	}, null);

	comp.bind('change', function(ev, newVal) {
		changeCount++;
		comp();
	});

	setTimeout(function(){
		idCompute(2);
	}, 50);

	var checkChangeCount = function(){
		if(changeCount === 4) {
			equal(changeCount, 4);
			start();
		} else {
			setTimeout(checkChangeCount, 10);
		}
	};
	checkChangeCount();
});

test("Listening to input change", function(){
	var input = document.createElement("input");
	var comp = compute(input, "value", "input");

	comp.on("change", function(){
		ok(true, "it changed");
	});

	input.value = 'foo';
	domDispatch(input, "input");
});

test("Setting an input to change", function(){
	var input = document.createElement("input");
	var comp = compute(input, "value", "input");

	comp("foo");
	ok(input.value === "foo");
});

test("compute.truthy with functions (canjs/can-stache#172)", function () {
	var func = compute(function() {
		return function() {
			ok(false, "should not be run");
		};
	});

	var truthy = compute.truthy(func);

	equal(truthy(), true);
});

test("works with can-reflect", 5, function(){
	var c = compute(0);

	QUnit.equal( canReflect.getValue(c), 0, "unbound value");

	var handler = function(newValue){
		QUnit.equal(newValue, 1, "observed new value");

		canReflect.offValue(c, handler);

	};
	QUnit.ok(canReflect.isValueLike(c), "isValueLike is true");

	canReflect.onValue(c, handler);
	QUnit.equal( canReflect.valueHasDependencies(c), undefined, "valueHasDependencies");

	c(1);

	QUnit.equal( canReflect.getValue(c), 1, "bound value");
	c(2);

});

QUnit.test("can-reflect valueHasDependencies", function(){
	var a = compute("a");
	var b = compute("b");

	var c = compute(function(){
		return a() +  b();
	});

	c.on("change", function(){});

	QUnit.ok( canReflect.valueHasDependencies(c), "valueHasDependencies");


});

QUnit.test("registered symbols", function() {
	var a = compute("a");

	ok(a[canSymbol.for("can.isValueLike")], "can.isValueLike");
	equal(a[canSymbol.for("can.getValue")](), "a", "can.getValue");
	a[canSymbol.for("can.setValue")]("b");
	equal(a(), "b", "can.setValue");

	function handler(val) {
		equal(val, "c", "can.onValue");
	}

	a[canSymbol.for("can.onValue")](handler);
	a("c");

	a[canSymbol.for("can.offValue")](handler);
	a("d"); // doesn't trigger handler
});

QUnit.test("can-reflect setValue", function(){
	var a = compute("a");

	canReflect.setValue(a, "A");
	QUnit.equal(a(), "A", "compute");
});

QUnit.test("Calling .unbind() with no arguments should tear down all event handlers", function () {
	var count = compute(0);
	count.on('change', function() {
		console.log('Count changed');
	});
	var handlers = count.computeInstance[canSymbol.for("can.meta")].handlers;

	QUnit.equal(handlers.get(["change"]).length, 1, "Change event added");

	count.unbind();
	QUnit.equal(handlers.get(["change"]).length, 0, "All events for compute removed");
});

QUnit.test(".off() unbinds a given handler", function () {
	var handler = function(){};
	var c = compute('foo');

	c.on('change', handler);

	var handlers = c.computeInstance[canSymbol.for("can.meta")].handlers;

	QUnit.equal(handlers.get(['change']).length, 1, 'handler added');

	c.off('change', handler);

	QUnit.equal(handlers.get(['change']).length, 0, 'hander removed');
});
