var QUnit = require('steal-qunit');
var Compute = require('can-compute/proto-compute');

var queues = require('can-queues');
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");


QUnit.module('can/Compute');

test('single value compute', function () {
	expect(2);
	var num = new Compute(1);
	num.bind('change', function (ev, newVal, oldVal) {
		equal(newVal, 2, 'newVal');
		equal(oldVal, 1, 'oldVal');
	});
	num.set(2);
});

test('inner computes values are not bound to', function () {
	var num = new Compute(1);
	var outer = new Compute(function() {
		var inner = new Compute(function() {
			return num.get() + 1;
		});
		return 2 * inner.get();
	});
	var handler = function() {};
	outer.bind('change', handler);
	// We do a timeout because we temporarily bind on num so that we can use its cached value.
	stop();
	setTimeout(function() {
		var handlers = num[canSymbol.for("can.meta")].handlers;
		equal(handlers.get([]).length, 1, 'compute only bound to once');
		start();
	}, 50);
});

test('compute.truthy', function() {
	var result = 0;
	var num = new Compute(3);
	var truthy = Compute.truthy(num);
	var tester = new Compute(function() {
		if(truthy.get()) {
			return ++result;
		} else {
			return ++result;
		}
	});

	tester.bind('change', function(ev, newVal, oldVal) {
		if (num.get() === 0) {
			equal(newVal, 2, '2 is the new val');
		} else if (num.get() === -1) {
			equal(newVal, 3, '3 is the new val');
		} else {
			ok(false, 'change should not be called');
		}
	});
	equal(tester.get(), 1, 'on bind, we call tester once');
	num.set(2);
	num.set(1);
	num.set(0);
	num.set(-1);
});

test('a binding compute does not double read', function () {
	var sourceAge = 30,
		timesComputeIsCalled = 0;
	var age = new Compute(function (newVal) {
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

	var info = new Compute(function () {
		return 'I am ' + age.get();
	});

	var k = function () {};
	info.bind('change', k);
	equal(info.get(), 'I am 30');
	age.set(31);
	equal(info.get(), 'I am 31');
});

test('cloning a setter compute (#547)', function () {
	var name = new Compute('', function(newVal) {
		return this.txt + newVal;
	});

	var cloned = name.clone({
		txt: '.'
	});

	cloned.set('-');
	equal(cloned.get(), '.-');
});

test('compute updated method uses get and old value (#732)', function () {
	expect(9);

	var input = {
		value: 1
	};

	var value = new Compute('', {
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

	equal(value.get(), 1, 'original value');
	ok(!input.onchange, 'nothing bound');
	value.set(2);
	equal(value.get(), 2, 'updated value');
	equal(input.value, 2, 'updated input.value');

	value.bind('change', function (ev, newVal, oldVal) {
		equal(newVal, 3, 'newVal');
		equal(oldVal, 2, 'oldVal');
		value.unbind('change', this.Constructor);
	});

	ok(input.onchange, 'binding to onchange');

	input.value = 3;
	input.onchange({});

	ok(!input.onchange, 'removed binding');
	equal(value.get(), 3);
});

test('a compute updated by source changes within a batch is part of that batch', function () {
	var computeA = new Compute('a');
	var computeB = new Compute('b');

	var combined1 = new Compute(function() {
		return computeA.get() + ' ' + computeB.get();
	});

	var combined2 = new Compute(function() {
		return computeA.get() + ' ' + computeB.get();
	});

	var combo = new Compute(function() {
		return combined1.get() + ' ' + combined2.get();
	});


	var callbacks = 0;
	combo.bind('change', function(){
		if(callbacks === 0){
			ok(true, 'called change once');
		} else {
			ok(false, 'called change multiple times');
		}
		callbacks++;
	});

	queues.batch.start();
	computeA.set('A');
	computeB.set('B');
	queues.batch.stop();
});

test('Compute.async can be like a normal getter', function() {
	var first = new Compute('Justin'),
		last = new Compute('Meyer'),
		fullName = Compute.async('', function(){
			return first.get() + ' ' + last.get();
		});

	equal(fullName.get(), 'Justin Meyer');
});

test('Compute.async operate on single value', function() {
	var a = new Compute(1);
	var b = new Compute(2);

	var obj = Compute.async({}, function(curVal) {
		if(a.get()) {
			curVal.a = a.get();
		} else {
			delete curVal.a;
		}

		if(b.get()) {
			curVal.b = b.get();
		} else {
			delete curVal.b;
		}

		return curVal;
	});

	obj.bind('change', function() {});
	deepEqual(obj.get(), {a: 1, b: 2}, 'object has all properties');

	a.set(0);
	deepEqual(obj.get(), {b: 2}, 'removed a');

	b.set(0);
	deepEqual(obj.get(), {}, 'removed b');
});

test('Compute.async async changing value', function() {
	var a = new Compute(1);
	var b = new Compute(2);

	var async = Compute.async(undefined, function(curVal, setVal) {
		if(a.get()) {
			setTimeout(function() {
				setVal('a');
			}, 10);
		} else if(b.get()) {
			setTimeout(function() {
				setVal('b');
			}, 10);
		} else {
			return null;
		}
	});

	var changeArgs = [
		{newVal: 'a', oldVal: undefined, run: function() { a.set(0); } },
		{newVal: 'b', oldVal: 'a', run: function() { b.set(0); }},
		{newVal: null, oldVal: 'b', run: function() { start(); }}
	],
	changeNum = 0;

	stop();

	async.bind('change', function(ev, newVal, oldVal) {
		var data = changeArgs[changeNum++];
		equal( newVal, data.newVal, 'newVal is correct' );
		equal( oldVal, data.oldVal, 'oldVal is correct' );

		setTimeout(data.run, 10);
	});
});

test('Compute.async read without binding', function() {
	var source = new Compute(1);

	var async = Compute.async([],function( curVal, setVal ) {
		curVal.push(source.get());
		return curVal;
	});

	ok(async.get(), 'calling async worked');
});

test('Compute.async set uses last set or initial value', function() {

	var add = new Compute(1);

	var fnCount = 0;

	var async = Compute.async(10,function( curVal ) {
		switch(fnCount++) {
			case 0:
				equal(curVal, 10);
				break;
			case 1:
				equal(curVal, 20);
				break;
			case 2:
				equal(curVal, 30, "on bind");
				break;
			case 3:
				equal(curVal, 30, "on bind");
				break;
		}
		return curVal+add.get();
	});

	equal(async.get(), 11, "initial value");

	async.set(20);

	async.bind("change", function(){});

	async.set(20);

	async.set(30);
});

test("Change propagation in a batch with late bindings (#2412)", function(){
	var rootA = new Compute('a');
	var rootB = new Compute('b');

	var childA = new Compute(function() {
	  return "childA"+rootA.get();
	});

	var grandChild = new Compute(function() {

	  var b = rootB.get();
	  if (b === "b") {
		return "grandChild->b";
	  }

	  var a = childA.get();
	  return "grandChild->"+a;
	});



	childA.bind('change', function(ev, newVal, oldVal) {});

	grandChild.bind('change', function(ev, newVal, oldVal) {
	  equal(newVal, "grandChild->childAA");
	});


	queues.batch.start();
	rootA.set('A');
	rootB.set('B');
	queues.batch.stop();

});

if (Compute.prototype.trace) {
	test("trace", function(){
		var rootA = new Compute('a');
		var rootB = new Compute('b');

		var childA = new Compute(function() {
			return "childA"+rootA.get();
		});

		var fn = function() {
			var b = rootB.get();
			if (b === "b") {
				return "grandChild->b";
			}
			var a = childA.get();
			return "grandChild->"+a;
		};
		var grandChild = new Compute(fn);



		childA.bind('change', function(ev, newVal, oldVal) {});

		grandChild.bind('change', function(ev, newVal, oldVal) {
			equal(newVal, "grandChild->childAA");
		});

		var out = grandChild.trace();
		equal(out.definition, fn, "got the right function");
		equal(out.computeValue, "grandChild->b");
		grandChild.log();
		queues.batch.start();
		rootA.set('A');
		rootB.set('B');
		queues.batch.stop();
		grandChild.log();

	});
}

test("works with can-reflect", 5, function(){
	var c = new Compute(0);

	QUnit.equal( canReflect.getValue(c), 0, "unbound value");

	QUnit.ok(canReflect.isValueLike(c), "isValueLike is true");

	QUnit.ok( !canReflect.valueHasDependencies(c), "valueHasDependencies -- false");
	var d = new Compute(function() {
		return c.get();
	});
	d.on("change", function() {});
	QUnit.ok( canReflect.valueHasDependencies(d), "valueHasDependencies -- true");

	c.set(1);

	QUnit.equal( canReflect.getValue(d), 1, "bound value");
	c.set(2);

});

QUnit.test("can-reflect setValue", function(){
	var a = new Compute("a");

	canReflect.setValue(a, "A");
	QUnit.equal(a.get(), "A", "compute");
});

QUnit.test("registered symbols", function() {
	var a = new Compute("a");

	ok(a[canSymbol.for("can.isValueLike")], "can.isValueLike");
	equal(a[canSymbol.for("can.getValue")](), "a", "can.getValue");
	a[canSymbol.for("can.setValue")]("b");
	equal(a.get(), "b", "can.setValue");

	function handler(val) {
		equal(val, "c", "can.onValue");
	}

	a[canSymbol.for("can.onValue")](handler);
	a.set("c");

	a[canSymbol.for("can.offValue")](handler);
	a.set("d"); // doesn't trigger handler
});

QUnit.test("canReflect.onValue should get the previous value", function(assert) {
	var a = new Compute("a");
	var done = assert.async();

	canReflect.onValue(a, function(newVal, oldVal) {
		assert.equal(newVal, "b");
		assert.equal(oldVal, "a");
		done();
	});

	a.set("b");
});
