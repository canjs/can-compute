/*can-compute@3.0.0-pre.0#proto-compute*/
var read = require('./read.js');
var ObserveInfo = require('can-observe-info');
var canEvent = require('can-event');
var eventLifecycle = require('can-event/lifecycle/lifecycle');
var canBatch = require('can-event/batch/batch');
var CID = require('can-util/js/cid/cid');
var assign = require('can-util/js/assign/assign');
var types = require('can-util/js/types/types');
var string = require('can-util/js/string/string');
var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
var Compute = function (getterSetter, context, eventName, bindOnce) {
    CID(this, 'compute');
    var args = [];
    for (var i = 0, arglen = arguments.length; i < arglen; i++) {
        args[i] = arguments[i];
    }
    var contextType = typeof args[1];
    if (typeof args[0] === 'function') {
        this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
    } else if (args[1]) {
        if (contextType === 'string') {
            this._setupProperty(args[0], args[1], args[2]);
        } else if (contextType === 'function') {
            this._setupSetter(args[0], args[1], args[2]);
        } else {
            if (args[1] && args[1].fn) {
                this._setupAsyncCompute(args[0], args[1]);
            } else {
                this._setupSettings(args[0], args[1]);
            }
        }
    } else {
        this._setupSimpleValue(args[0]);
    }
    this._args = args;
    this._primaryDepth = 0;
    this.isComputed = true;
};
assign(Compute.prototype, {
    setPrimaryDepth: function (depth) {
        this._primaryDepth = depth;
    },
    _setupGetterSetterFn: function (getterSetter, context, eventName) {
        this._set = context ? getterSetter.bind(context) : getterSetter;
        this._get = context ? getterSetter.bind(context) : getterSetter;
        this._canObserve = eventName === false ? false : true;
        var handlers = setupComputeHandlers(this, getterSetter, context || this);
        assign(this, handlers);
    },
    _setupProperty: function (target, propertyName, eventName) {
        var isObserve = types.isMapLike(target), self = this, handler;
        if (isObserve) {
            handler = function (ev, newVal, oldVal) {
                self.updater(newVal, oldVal, ev.batchNum);
            };
            this.hasDependencies = true;
            this._get = function () {
                return target.attr(propertyName);
            };
            this._set = function (val) {
                target.attr(propertyName, val);
            };
        } else {
            handler = function () {
                self.updater(self._get(), self.value);
            };
            this._get = function () {
                return string.getObject(propertyName, [target]);
            };
            this._set = function (value) {
                var properties = propertyName.split('.'), leafPropertyName = properties.pop(), targetProperty = string.getObject(properties.join('.'), [target]);
                targetProperty[leafPropertyName] = value;
            };
        }
        this._on = function (update) {
            canEvent.addEventListener.call(target, eventName || propertyName, handler);
            this.value = this._get();
        };
        this._off = function () {
            return canEvent.removeEventListener.call(target, eventName || propertyName, handler);
        };
    },
    _setupSetter: function (initialValue, setter, eventName) {
        this.value = initialValue;
        this._set = setter;
        assign(this, eventName);
    },
    _setupSettings: function (initialValue, settings) {
        this.value = initialValue;
        this._set = settings.set || this._set;
        this._get = settings.get || this._get;
        if (!settings.__selfUpdater) {
            var self = this, oldUpdater = this.updater;
            this.updater = function () {
                oldUpdater.call(self, self._get(), self.value);
            };
        }
        this._on = settings.on ? settings.on : this._on;
        this._off = settings.off ? settings.off : this._off;
    },
    _setupAsyncCompute: function (initialValue, settings) {
        var self = this;
        this.value = initialValue;
        this._setUpdates = true;
        this.lastSetValue = new Compute(initialValue);
        this._set = function (newVal) {
            if (newVal === self.lastSetValue.get()) {
                return this.value;
            }
            return self.lastSetValue.set(newVal);
        };
        this._get = function () {
            return getter.call(settings.context, self.lastSetValue.get());
        };
        var getter = settings.fn, bindings;
        if (getter.length === 0) {
            bindings = setupComputeHandlers(this, getter, settings.context);
        } else if (getter.length === 1) {
            bindings = setupComputeHandlers(this, function () {
                return getter.call(settings.context, self.lastSetValue.get());
            }, settings);
        } else {
            var oldUpdater = this.updater, setValue = function (newVal) {
                    oldUpdater.call(self, newVal, self.value);
                };
            this.updater = function (newVal) {
                oldUpdater.call(self, newVal, self.value);
            };
            bindings = setupComputeHandlers(this, function () {
                var res = getter.call(settings.context, self.lastSetValue.get(), setValue);
                return res !== undefined ? res : this.value;
            }, this);
        }
        assign(this, bindings);
    },
    _setupSimpleValue: function (initialValue) {
        this.value = initialValue;
    },
    _eventSetup: ObserveInfo.notObserve(function () {
        this.bound = true;
        this._on(this.updater);
    }),
    _eventTeardown: function () {
        this._off(this.updater);
        this.bound = false;
    },
    addEventListener: eventLifecycle.addAndSetup,
    removeEventListener: eventLifecycle.removeAndTeardown,
    clone: function (context) {
        if (context && typeof this._args[0] === 'function') {
            this._args[1] = context;
        } else if (context) {
            this._args[2] = context;
        }
        return new Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
    },
    _on: function () {
    },
    _off: function () {
    },
    get: function () {
        if (ObserveInfo.isRecording() && this._canObserve !== false) {
            ObserveInfo.observe(this, 'change');
            if (!this.bound) {
                Compute.temporarilyBind(this);
            }
        }
        if (this.bound) {
            return this.value;
        } else {
            return this._get();
        }
    },
    _get: function () {
        return this.value;
    },
    set: function (newVal) {
        var old = this.value;
        var setVal = this._set(newVal, old);
        if (this._setUpdates) {
            return this.value;
        }
        if (this.hasDependencies) {
            return this._get();
        }
        if (setVal === undefined) {
            this.value = this._get();
        } else {
            this.value = setVal;
        }
        updateOnChange(this, this.value, old);
        return this.value;
    },
    _set: function (newVal) {
        return this.value = newVal;
    },
    updater: function (newVal, oldVal, batchNum) {
        this.value = newVal;
        updateOnChange(this, newVal, oldVal, batchNum);
    },
    toFunction: function () {
        return this._computeFn.bind(this);
    },
    _computeFn: function (newVal) {
        if (arguments.length) {
            return this.set(newVal);
        }
        return this.get();
    }
});
Compute.prototype.on = Compute.prototype.bind = Compute.prototype.addEventListener;
Compute.prototype.off = Compute.prototype.unbind = Compute.prototype.removeEventListener;
var updateOnChange = function (compute, newValue, oldValue, batchNum) {
    var valueChanged = newValue !== oldValue && !(newValue !== newValue && oldValue !== oldValue);
    if (valueChanged) {
        canBatch.trigger.call(compute, {
            type: 'change',
            batchNum: batchNum
        }, [
            newValue,
            oldValue
        ]);
    }
};
var setupComputeHandlers = function (compute, func, context) {
    var readInfo = new ObserveInfo(func, context, compute);
    return {
        _on: function () {
            readInfo.getValueAndBind();
            compute.value = readInfo.value;
            compute.hasDependencies = !isEmptyObject(readInfo.newObserved);
        },
        _off: function () {
            readInfo.teardown();
        },
        getDepth: function () {
            return readInfo.getDepth();
        }
    };
};
var k = function () {
};
Compute.temporarilyBind = function (compute) {
    var computeInstance = compute.computeInstance || compute;
    computeInstance.addEventListener('change', k);
    if (!computes) {
        computes = [];
        setTimeout(unbindComputes, 10);
    }
    computes.push(computeInstance);
};
var computes, unbindComputes = function () {
        for (var i = 0, len = computes.length; i < len; i++) {
            computes[i].removeEventListener('change', k);
        }
        computes = null;
    };
Compute.async = function (initialValue, asyncComputer, context) {
    return new Compute(initialValue, {
        fn: asyncComputer,
        context: context
    });
};
Compute.truthy = function (compute) {
    return new Compute(function () {
        var res = compute.get();
        if (typeof res === 'function') {
            res = res.get();
        }
        return !!res;
    });
};
Compute.read = read;
Compute.set = read.write;
module.exports = exports = Compute;