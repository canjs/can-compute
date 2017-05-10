var compute = require('can-compute');
var QUnit = require('steal-qunit');

QUnit.asyncTest('deferred basics', 2, function() {
	var foo = compute.deferred();

	QUnit.equal(foo.computeInstance.observation.deferred, true, 'observation is deferred');
	QUnit.equal(typeof foo.startDeferred, 'function', 'startDeferred method exists');
	QUnit.equal(typeof foo.stopDeferred, 'function', 'stopDeferred method exists');
});
