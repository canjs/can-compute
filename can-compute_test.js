require("./can-compute-async-test");

var compute = require('can-compute');
var Compute = require('can-compute/proto-compute');
var QUnit = require('steal-qunit');
var canBatch = require('can-event/batch/');
var Observation = require('can-observation');
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var domDispatch = require("can-util/dom/dispatch/dispatch");
//require('./read_test');

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
		equal(num.computeInstance.__bindEvents._lifecycleBindings, 1, 'inner compute only bound once');
		equal(outer.computeInstance.__bindEvents._lifecycleBindings, 1, 'outer compute only bound once');
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



	value.bind('change', function (ev, newVal, oldVal) {
		equal(newVal, 3, 'newVal');
		equal(oldVal, 2, 'oldVal');
		value.unbind('change', this.Constructor);
	});
	ok(input.onchange, 'binding to onchange');


	input.value = 3;
	input.onchange({});

	ok(!input.onchange, 'removed binding');
	equal(value(), 3);
});

test("a compute updated by source changes within a batch is part of that batch", function(){

	var computeA = compute("a");
	var computeB = compute("b");

	var combined1 = compute(function(){

		return computeA()+" "+computeB();

	});

	var combined2 = compute(function(){

		return computeA()+" "+computeB();

	});

	var combo = compute(function(){
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

	canBatch.start();
	computeA("A");
	computeB("B");
	canBatch.stop();
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


// ========================================
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
	var num = new Compute(1),
		numBind = num.addEventListener,
		numUnbind = num.removeEventListener;
	var bindCount = 0;
	num.addEventListener = function() {
		bindCount++;
		return numBind.apply(this, arguments);
	};
	num.removeEventListener = function() {
		bindCount--;
		return numUnbind.apply(this, arguments);
	};
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
		equal(bindCount, 1, 'compute only bound to once');
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

	canBatch.start();
	computeA.set('A');
	computeB.set('B');
	canBatch.stop();
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



	canBatch.start();
	root('b');
	canBatch.stop();

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

	canBatch.start();
	root('b');
	canBatch.stop();
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



	canBatch.start();
	root('b');
	canBatch.stop();

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

test("Observation.isRecording observes doesn't understand Observation.ignore (#2099)", function(){
	expect(0);
	var c = compute(1);
	c.computeInstance.bind = function() {
		ok(false);
	};

	var outer = compute(function(){
		Observation.ignore(function(){
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

	canBatch.start();
	root1("ROOT1");
	canBatch.stop();

});

test("compute should not fire event when NaN is set multiple times #2128", function() {
	var c = compute(NaN);

	compute.bind("change", function() {
		ok(false, "change event should not be fired");
	});

	ok(isNaN(c()));
	c(NaN);
});

test("canBatch.afterPreviousEvents firing too late (#2198)", function(){


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

		canBatch.start();
		canBatch.stop();

		// we should get this callback before we are notified of the change
		canBatch.afterPreviousEvents(function() {
			afterPrevious = true;
		});

		compute2("c");
	});

	canBatch.start();
	compute1("x");
	canBatch.stop();
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


	canBatch.start();
	rootA.set('A');
	rootB.set('B');
	canBatch.stop();

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
		canBatch.start();
		rootA.set('A');
		rootB.set('B');
		canBatch.stop();
		grandChild.log();

	});
}

test("compute(defineMap, 'property.names') works (#20)", function(){
	var map = new DefineMap();
	var c = compute(map, "foo.bar");
	c.on("change", function(ev, newVal){
		QUnit.equal(newVal, 2);
	});

	map.set("foo", new DefineMap());
	map.foo.set("bar", 2);

});

test("compute(DefineList, 0) works (#17)", function(assert){
	assert.expect(1);
	var list = new DefineList([1,2,3]);
	var c = compute(list, 0);
	c.on("change", function(ev, newVal){
		assert.equal(newVal, 5);
	});
	list.set(0, 5);
});

test("Async getter causes infinite loop (#28)", function(){
	var changeCount = 0;
	var idCompute = compute(1);
	stop();

	var comp = compute.async(undefined, function(last, resolve) {
		var id = idCompute();

		setTimeout(function(){
			resolve(changeCount + '|' + id);
		});

		resolve(changeCount + '|' + id);
	}, null);

	comp.bind('change', function(ev, newVal) {
		changeCount++;
		comp();
	});

	setTimeout(function(){
		idCompute(2);
	}, 50);

	setTimeout(function() {
		equal(changeCount, 4);
		start();
	}, 100);
});

test("Listening to input change", function(){
	var input = document.createElement("input");
	var comp = compute(input, "value", "input");

	comp.on("change", function(){
		ok(true, "it changed");
	});

	input.value = 'foo';
	domDispatch.call(input, "input");
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
