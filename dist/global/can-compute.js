/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({"can-namespace":"can"},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-util@3.8.4#js/global/global*/
define('can-util/js/global/global', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL;
        module.exports = function (setGlobal) {
            if (setGlobal !== undefined) {
                GLOBAL = setGlobal;
            }
            if (GLOBAL) {
                return GLOBAL;
            } else {
                return GLOBAL = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : typeof process === 'object' && {}.toString.call(process) === '[object process]' ? global : window;
            }
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.8.4#dom/document/document*/
define('can-util/dom/document/document', function (require, exports, module) {
    (function (global) {
        'use strict';
        var global = require('can-util/js/global/global');
        var setDocument;
        module.exports = function (setDoc) {
            if (setDoc) {
                setDocument = setDoc;
            }
            return setDocument || global().document;
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.8.4#js/is-browser-window/is-browser-window*/
define('can-util/js/is-browser-window/is-browser-window', function (require, exports, module) {
    (function (global) {
        'use strict';
        module.exports = function () {
            return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof SimpleDOM === 'undefined';
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.8.4#js/is-plain-object/is-plain-object*/
define('can-util/js/is-plain-object/is-plain-object', function (require, exports, module) {
    'use strict';
    var core_hasOwn = Object.prototype.hasOwnProperty;
    function isWindow(obj) {
        return obj !== null && obj == obj.window;
    }
    function isPlainObject(obj) {
        if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
            return false;
        }
        try {
            if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return key === undefined || core_hasOwn.call(obj, key);
    }
    module.exports = isPlainObject;
});
/*can-util@3.8.4#dom/events/events*/
define('can-util/dom/events/events', function (require, exports, module) {
    'use strict';
    var _document = require('can-util/dom/document/document');
    var isBrowserWindow = require('can-util/js/is-browser-window/is-browser-window');
    var isPlainObject = require('can-util/js/is-plain-object/is-plain-object');
    var fixSyntheticEventsOnDisabled = false;
    function isDispatchingOnDisabled(element, ev) {
        var isInsertedOrRemoved = isPlainObject(ev) ? ev.type === 'inserted' || ev.type === 'removed' : ev === 'inserted' || ev === 'removed';
        var isDisabled = !!element.disabled;
        return isInsertedOrRemoved && isDisabled;
    }
    module.exports = {
        addEventListener: function () {
            this.addEventListener.apply(this, arguments);
        },
        removeEventListener: function () {
            this.removeEventListener.apply(this, arguments);
        },
        canAddEventListener: function () {
            return this.nodeName && (this.nodeType === 1 || this.nodeType === 9) || this === window;
        },
        dispatch: function (event, args, bubbles) {
            var ret;
            var dispatchingOnDisabled = fixSyntheticEventsOnDisabled && isDispatchingOnDisabled(this, event);
            var doc = this.ownerDocument || _document();
            var ev = doc.createEvent('HTMLEvents');
            var isString = typeof event === 'string';
            ev.initEvent(isString ? event : event.type, bubbles === undefined ? true : bubbles, false);
            if (!isString) {
                for (var prop in event) {
                    if (ev[prop] === undefined) {
                        ev[prop] = event[prop];
                    }
                }
            }
            ev.args = args;
            if (dispatchingOnDisabled) {
                this.disabled = false;
            }
            ret = this.dispatchEvent(ev);
            if (dispatchingOnDisabled) {
                this.disabled = true;
            }
            return ret;
        }
    };
    (function () {
        if (!isBrowserWindow()) {
            return;
        }
        var testEventName = 'fix_synthetic_events_on_disabled_test';
        var input = document.createElement('input');
        input.disabled = true;
        var timer = setTimeout(function () {
            fixSyntheticEventsOnDisabled = true;
        }, 50);
        var onTest = function onTest() {
            clearTimeout(timer);
            module.exports.removeEventListener.call(input, testEventName, onTest);
        };
        module.exports.addEventListener.call(input, testEventName, onTest);
        try {
            module.exports.dispatch.call(input, testEventName, [], false);
        } catch (e) {
            onTest();
            fixSyntheticEventsOnDisabled = true;
        }
    }());
});
/*can-namespace@1.0.0#can-namespace*/
define('can-namespace', function (require, exports, module) {
    module.exports = {};
});
/*can-cid@1.0.3#can-cid*/
define('can-cid', function (require, exports, module) {
    var namespace = require('can-namespace');
    var _cid = 0;
    var cid = function (object, name) {
        if (!object._cid) {
            _cid++;
            object._cid = (name || '') + _cid;
        }
        return object._cid;
    };
    if (namespace.cid) {
        throw new Error('You can\'t have two versions of can-cid, check your dependencies');
    } else {
        module.exports = namespace.cid = cid;
    }
});
/*can-util@3.8.4#js/is-empty-object/is-empty-object*/
define('can-util/js/is-empty-object/is-empty-object', function (require, exports, module) {
    'use strict';
    module.exports = function (obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    };
});
/*can-util@3.8.4#dom/dispatch/dispatch*/
define('can-util/dom/dispatch/dispatch', function (require, exports, module) {
    'use strict';
    var domEvents = require('can-util/dom/events/events');
    module.exports = function () {
        return domEvents.dispatch.apply(this, arguments);
    };
});
/*can-util@3.8.4#dom/data/core*/
define('can-util/dom/data/core', function (require, exports, module) {
    'use strict';
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var data = {};
    var expando = 'can' + new Date();
    var uuid = 0;
    var setData = function (name, value) {
        var id = this[expando] || (this[expando] = ++uuid), store = data[id], newStore = false;
        if (!data[id]) {
            newStore = true;
            store = data[id] = {};
        }
        if (name !== undefined) {
            store[name] = value;
        }
        return newStore;
    };
    var deleteNode = function () {
        var id = this[expando];
        var nodeDeleted = false;
        if (id && data[id]) {
            nodeDeleted = true;
            delete data[id];
        }
        return nodeDeleted;
    };
    module.exports = {
        _data: data,
        getCid: function () {
            return this[expando];
        },
        cid: function () {
            return this[expando] || (this[expando] = ++uuid);
        },
        expando: expando,
        get: function (key) {
            var id = this[expando], store = id && data[id];
            return key === undefined ? store || setData(this) : store && store[key];
        },
        set: setData,
        clean: function (prop) {
            var id = this[expando];
            var itemData = data[id];
            if (itemData && itemData[prop]) {
                delete itemData[prop];
            }
            if (isEmptyObject(itemData)) {
                deleteNode.call(this);
            }
        },
        delete: deleteNode
    };
});
/*can-util@3.8.4#dom/mutation-observer/mutation-observer*/
define('can-util/dom/mutation-observer/mutation-observer', function (require, exports, module) {
    (function (global) {
        'use strict';
        var global = require('can-util/js/global/global')();
        var setMutationObserver;
        module.exports = function (setMO) {
            if (setMO !== undefined) {
                setMutationObserver = setMO;
            }
            return setMutationObserver !== undefined ? setMutationObserver : global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.8.4#js/is-array-like/is-array-like*/
define('can-util/js/is-array-like/is-array-like', function (require, exports, module) {
    'use strict';
    function isArrayLike(obj) {
        var type = typeof obj;
        if (type === 'string') {
            return true;
        } else if (type === 'number') {
            return false;
        }
        var length = obj && type !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof obj !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    }
    module.exports = isArrayLike;
});
/*can-types@1.0.4#can-types*/
define('can-types', function (require, exports, module) {
    var namespace = require('can-namespace');
    var types = {
        isMapLike: function () {
            return false;
        },
        isListLike: function () {
            return false;
        },
        isPromise: function (obj) {
            return obj instanceof Promise || Object.prototype.toString.call(obj) === '[object Promise]';
        },
        isConstructor: function (func) {
            if (typeof func !== 'function') {
                return false;
            }
            for (var prop in func.prototype) {
                return true;
            }
            return false;
        },
        isCallableForValue: function (obj) {
            return typeof obj === 'function' && !types.isConstructor(obj);
        },
        isCompute: function (obj) {
            return obj && obj.isComputed;
        },
        iterator: typeof Symbol === 'function' && Symbol.iterator || '@@iterator',
        DefaultMap: null,
        DefaultList: null,
        queueTask: function (task) {
            var args = task[2] || [];
            task[0].apply(task[1], args);
        },
        wrapElement: function (element) {
            return element;
        },
        unwrapElement: function (element) {
            return element;
        }
    };
    if (namespace.types) {
        throw new Error('You can\'t have two versions of can-types, check your dependencies');
    } else {
        module.exports = namespace.types = types;
    }
});
/*can-util@3.8.4#js/is-iterable/is-iterable*/
define('can-util/js/is-iterable/is-iterable', function (require, exports, module) {
    'use strict';
    var types = require('can-types');
    module.exports = function (obj) {
        return obj && !!obj[types.iterator];
    };
});
/*can-util@3.8.4#js/each/each*/
define('can-util/js/each/each', function (require, exports, module) {
    'use strict';
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    var has = Object.prototype.hasOwnProperty;
    var isIterable = require('can-util/js/is-iterable/is-iterable');
    var types = require('can-types');
    function each(elements, callback, context) {
        var i = 0, key, len, item;
        if (elements) {
            if (isArrayLike(elements)) {
                for (len = elements.length; i < len; i++) {
                    item = elements[i];
                    if (callback.call(context || item, item, i, elements) === false) {
                        break;
                    }
                }
            } else if (isIterable(elements)) {
                var iter = elements[types.iterator]();
                var res, value;
                while (!(res = iter.next()).done) {
                    value = res.value;
                    callback.call(context || elements, Array.isArray(value) ? value[1] : value, value[0]);
                }
            } else if (typeof elements === 'object') {
                for (key in elements) {
                    if (has.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                        break;
                    }
                }
            }
        }
        return elements;
    }
    module.exports = each;
});
/*can-util@3.8.4#js/cid/get-cid*/
define('can-util/js/cid/get-cid', function (require, exports, module) {
    'use strict';
    var CID = require('can-cid');
    var domDataCore = require('can-util/dom/data/core');
    module.exports = function (obj) {
        if (typeof obj.nodeType === 'number') {
            return domDataCore.cid.call(obj);
        } else {
            var type = typeof obj;
            var isObject = type !== null && (type === 'object' || type === 'function');
            return type + ':' + (isObject ? CID(obj) : obj);
        }
    };
});
/*can-util@3.8.4#js/cid-set/cid-set*/
define('can-util/js/cid-set/cid-set', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL = require('can-util/js/global/global');
        var each = require('can-util/js/each/each');
        var getCID = require('can-util/js/cid/get-cid');
        var CIDSet;
        if (GLOBAL().Set) {
            CIDSet = GLOBAL().Set;
        } else {
            var CIDSet = function () {
                this.values = {};
            };
            CIDSet.prototype.add = function (value) {
                this.values[getCID(value)] = value;
            };
            CIDSet.prototype['delete'] = function (key) {
                var has = getCID(key) in this.values;
                if (has) {
                    delete this.values[getCID(key)];
                }
                return has;
            };
            CIDSet.prototype.forEach = function (cb, thisArg) {
                each(this.values, cb, thisArg);
            };
            CIDSet.prototype.has = function (value) {
                return getCID(value) in this.values;
            };
            CIDSet.prototype.clear = function (key) {
                return this.values = {};
            };
            Object.defineProperty(CIDSet.prototype, 'size', {
                get: function () {
                    var size = 0;
                    each(this.values, function () {
                        size++;
                    });
                    return size;
                }
            });
        }
        module.exports = CIDSet;
    }(function () {
        return this;
    }()));
});
/*can-util@3.8.4#js/make-array/make-array*/
define('can-util/js/make-array/make-array', function (require, exports, module) {
    'use strict';
    var each = require('can-util/js/each/each');
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    function makeArray(element) {
        var ret = [];
        if (isArrayLike(element)) {
            each(element, function (a, i) {
                ret[i] = a;
            });
        } else if (element === 0 || element) {
            ret.push(element);
        }
        return ret;
    }
    module.exports = makeArray;
});
/*can-util@3.8.4#js/is-container/is-container*/
define('can-util/js/is-container/is-container', function (require, exports, module) {
    'use strict';
    module.exports = function (current) {
        return /^f|^o/.test(typeof current);
    };
});
/*can-util@3.8.4#js/get/get*/
define('can-util/js/get/get', function (require, exports, module) {
    'use strict';
    var isContainer = require('can-util/js/is-container/is-container');
    function get(obj, name) {
        var parts = typeof name !== 'undefined' ? (name + '').replace(/\[/g, '.').replace(/]/g, '').split('.') : [], length = parts.length, current, i, container;
        if (!length) {
            return obj;
        }
        current = obj;
        for (i = 0; i < length && isContainer(current); i++) {
            container = current;
            current = container[parts[i]];
        }
        return current;
    }
    module.exports = get;
});
/*can-util@3.8.4#js/log/log*/
define('can-util/js/log/log', function (require, exports, module) {
    'use strict';
    exports.warnTimeout = 5000;
    exports.logLevel = 0;
    exports.warn = function (out) {
        var ll = this.logLevel;
        if (ll < 2) {
            Array.prototype.unshift.call(arguments, 'WARN:');
            if (typeof console !== 'undefined' && console.warn) {
                this._logger('warn', Array.prototype.slice.call(arguments));
            } else if (typeof console !== 'undefined' && console.log) {
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS WARNING: ' + out);
            }
        }
    };
    exports.log = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.log) {
                Array.prototype.unshift.call(arguments, 'INFO:');
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS INFO: ' + out);
            }
        }
    };
    exports.error = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.error) {
                Array.prototype.unshift.call(arguments, 'ERROR:');
                this._logger('error', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('ERROR: ' + out);
            }
        }
    };
    exports._logger = function (type, arr) {
        try {
            console[type].apply(console, arr);
        } catch (e) {
            console[type](arr);
        }
    };
});
/*can-util@3.8.4#js/dev/dev*/
define('can-util/js/dev/dev', function (require, exports, module) {
    'use strict';
    var canLog = require('can-util/js/log/log');
    module.exports = {
        warnTimeout: 5000,
        logLevel: 0,
        stringify: function (value) {
            var flagUndefined = function flagUndefined(key, value) {
                return value === undefined ? '/* void(undefined) */' : value;
            };
            return JSON.stringify(value, flagUndefined, '  ').replace(/"\/\* void\(undefined\) \*\/"/g, 'undefined');
        },
        warn: function () {
        },
        log: function () {
        },
        error: function () {
        },
        _logger: canLog._logger
    };
});
/*can-util@3.8.4#js/is-array/is-array*/
define('can-util/js/is-array/is-array', function (require, exports, module) {
    'use strict';
    module.exports = function (arr) {
        return Array.isArray(arr);
    };
});
/*can-util@3.8.4#js/string/string*/
define('can-util/js/string/string', function (require, exports, module) {
    'use strict';
    var get = require('can-util/js/get/get');
    var isContainer = require('can-util/js/is-container/is-container');
    var canDev = require('can-util/js/dev/dev');
    var isArray = require('can-util/js/is-array/is-array');
    var strUndHash = /_|-/, strColons = /\=\=/, strWords = /([A-Z]+)([A-Z][a-z])/g, strLowUp = /([a-z\d])([A-Z])/g, strDash = /([a-z\d])([A-Z])/g, strReplacer = /\{([^\}]+)\}/g, strQuote = /"/g, strSingleQuote = /'/g, strHyphenMatch = /-+(.)?/g, strCamelMatch = /[a-z][A-Z]/g, convertBadValues = function (content) {
            var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
            return '' + (isInvalid ? '' : content);
        }, deleteAtPath = function (data, path) {
            var parts = path ? path.replace(/\[/g, '.').replace(/]/g, '').split('.') : [];
            var current = data;
            for (var i = 0; i < parts.length - 1; i++) {
                if (current) {
                    current = current[parts[i]];
                }
            }
            if (current) {
                delete current[parts[parts.length - 1]];
            }
        };
    var string = {
        esc: function (content) {
            return convertBadValues(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(strQuote, '&#34;').replace(strSingleQuote, '&#39;');
        },
        getObject: function (name, roots) {
            roots = isArray(roots) ? roots : [roots || window];
            var result, l = roots.length;
            for (var i = 0; i < l; i++) {
                result = get(roots[i], name);
                if (result) {
                    return result;
                }
            }
        },
        capitalize: function (s, cache) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        camelize: function (str) {
            return convertBadValues(str).replace(strHyphenMatch, function (match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        },
        hyphenate: function (str) {
            return convertBadValues(str).replace(strCamelMatch, function (str, offset) {
                return str.charAt(0) + '-' + str.charAt(1).toLowerCase();
            });
        },
        underscore: function (s) {
            return s.replace(strColons, '/').replace(strWords, '$1_$2').replace(strLowUp, '$1_$2').replace(strDash, '_').toLowerCase();
        },
        sub: function (str, data, remove) {
            var obs = [];
            str = str || '';
            obs.push(str.replace(strReplacer, function (whole, inside) {
                var ob = get(data, inside);
                if (remove === true) {
                    deleteAtPath(data, inside);
                }
                if (ob === undefined || ob === null) {
                    obs = null;
                    return '';
                }
                if (isContainer(ob) && obs) {
                    obs.push(ob);
                    return '';
                }
                return '' + ob;
            }));
            return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
        },
        replacer: strReplacer,
        undHash: strUndHash
    };
    module.exports = string;
});
/*can-util@3.8.4#dom/mutation-observer/document/document*/
define('can-util/dom/mutation-observer/document/document', function (require, exports, module) {
    (function (global) {
        'use strict';
        var getDocument = require('can-util/dom/document/document');
        var domDataCore = require('can-util/dom/data/core');
        var MUTATION_OBSERVER = require('can-util/dom/mutation-observer/mutation-observer');
        var each = require('can-util/js/each/each');
        var CIDStore = require('can-util/js/cid-set/cid-set');
        var makeArray = require('can-util/js/make-array/make-array');
        var string = require('can-util/js/string/string');
        var dispatchIfListening = function (mutatedNode, nodes, dispatched) {
            if (dispatched.has(mutatedNode)) {
                return true;
            }
            dispatched.add(mutatedNode);
            if (nodes.name === 'removedNodes') {
                var documentElement = getDocument().documentElement;
                if (documentElement.contains(mutatedNode)) {
                    return;
                }
            }
            nodes.handlers.forEach(function (handler) {
                handler(mutatedNode);
            });
            nodes.afterHandlers.forEach(function (handler) {
                handler(mutatedNode);
            });
        };
        var mutationObserverDocument = {
            add: function (handler) {
                var MO = MUTATION_OBSERVER();
                if (MO) {
                    var documentElement = getDocument().documentElement;
                    var globalObserverData = domDataCore.get.call(documentElement, 'globalObserverData');
                    if (!globalObserverData) {
                        var observer = new MO(function (mutations) {
                            globalObserverData.handlers.forEach(function (handler) {
                                handler(mutations);
                            });
                        });
                        observer.observe(documentElement, {
                            childList: true,
                            subtree: true
                        });
                        globalObserverData = {
                            observer: observer,
                            handlers: []
                        };
                        domDataCore.set.call(documentElement, 'globalObserverData', globalObserverData);
                    }
                    globalObserverData.handlers.push(handler);
                }
            },
            remove: function (handler) {
                var documentElement = getDocument().documentElement;
                var globalObserverData = domDataCore.get.call(documentElement, 'globalObserverData');
                if (globalObserverData) {
                    var index = globalObserverData.handlers.indexOf(handler);
                    if (index >= 0) {
                        globalObserverData.handlers.splice(index, 1);
                    }
                    if (globalObserverData.handlers.length === 0) {
                        globalObserverData.observer.disconnect();
                        domDataCore.clean.call(documentElement, 'globalObserverData');
                    }
                }
            }
        };
        var makeMutationMethods = function (name) {
            var mutationName = name.toLowerCase() + 'Nodes';
            var getMutationData = function () {
                var documentElement = getDocument().documentElement;
                var mutationData = domDataCore.get.call(documentElement, mutationName + 'MutationData');
                if (!mutationData) {
                    mutationData = {
                        name: mutationName,
                        handlers: [],
                        afterHandlers: [],
                        hander: null
                    };
                    if (MUTATION_OBSERVER()) {
                        domDataCore.set.call(documentElement, mutationName + 'MutationData', mutationData);
                    }
                }
                return mutationData;
            };
            var setup = function () {
                var mutationData = getMutationData();
                if (mutationData.handlers.length === 0 || mutationData.afterHandlers.length === 0) {
                    mutationData.handler = function (mutations) {
                        var dispatched = new CIDStore();
                        mutations.forEach(function (mutation) {
                            each(mutation[mutationName], function (mutatedNode) {
                                var children = mutatedNode.getElementsByTagName && makeArray(mutatedNode.getElementsByTagName('*'));
                                var alreadyChecked = dispatchIfListening(mutatedNode, mutationData, dispatched);
                                if (children && !alreadyChecked) {
                                    for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                                        dispatchIfListening(child, mutationData, dispatched);
                                    }
                                }
                            });
                        });
                    };
                    this.add(mutationData.handler);
                }
                return mutationData;
            };
            var teardown = function () {
                var documentElement = getDocument().documentElement;
                var mutationData = getMutationData();
                if (mutationData.handlers.length === 0 && mutationData.afterHandlers.length === 0) {
                    this.remove(mutationData.handler);
                    domDataCore.clean.call(documentElement, mutationName + 'MutationData');
                }
            };
            var createOnOffHandlers = function (name, handlerList) {
                mutationObserverDocument['on' + name] = function (handler) {
                    var mutationData = setup.call(this);
                    mutationData[handlerList].push(handler);
                };
                mutationObserverDocument['off' + name] = function (handler) {
                    var mutationData = getMutationData();
                    var index = mutationData[handlerList].indexOf(handler);
                    if (index >= 0) {
                        mutationData[handlerList].splice(index, 1);
                    }
                    teardown.call(this);
                };
            };
            var createHandlers = function (name) {
                createOnOffHandlers(name, 'handlers');
                createOnOffHandlers('After' + name, 'afterHandlers');
            };
            createHandlers(string.capitalize(mutationName));
        };
        makeMutationMethods('added');
        makeMutationMethods('removed');
        module.exports = mutationObserverDocument;
    }(function () {
        return this;
    }()));
});
/*can-util@3.8.4#dom/data/data*/
define('can-util/dom/data/data', function (require, exports, module) {
    'use strict';
    var domDataCore = require('can-util/dom/data/core');
    var mutationDocument = require('can-util/dom/mutation-observer/document/document');
    var deleteNode = function () {
        return domDataCore.delete.call(this);
    };
    var elementSetCount = 0;
    var cleanupDomData = function (node) {
        elementSetCount -= deleteNode.call(node) ? 1 : 0;
        if (elementSetCount === 0) {
            mutationDocument.offAfterRemovedNodes(cleanupDomData);
        }
    };
    module.exports = {
        getCid: domDataCore.getCid,
        cid: domDataCore.cid,
        expando: domDataCore.expando,
        clean: domDataCore.clean,
        get: domDataCore.get,
        set: function (name, value) {
            if (elementSetCount === 0) {
                mutationDocument.onAfterRemovedNodes(cleanupDomData);
            }
            elementSetCount += domDataCore.set.call(this, name, value) ? 1 : 0;
        },
        delete: deleteNode
    };
});
/*can-util@3.8.4#dom/matches/matches*/
define('can-util/dom/matches/matches', function (require, exports, module) {
    'use strict';
    var matchesMethod = function (element) {
        return element.matches || element.webkitMatchesSelector || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector;
    };
    module.exports = function () {
        var method = matchesMethod(this);
        return method ? method.apply(this, arguments) : false;
    };
});
/*can-util@3.8.4#dom/events/delegate/delegate*/
define('can-util/dom/events/delegate/delegate', function (require, exports, module) {
    'use strict';
    var domEvents = require('can-util/dom/events/events');
    var domData = require('can-util/dom/data/data');
    var domMatches = require('can-util/dom/matches/matches');
    var each = require('can-util/js/each/each');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var dataName = 'delegateEvents';
    var useCapture = function (eventType) {
        return eventType === 'focus' || eventType === 'blur';
    };
    var handleEvent = function (ev) {
        var events = domData.get.call(this, dataName);
        var eventTypeEvents = events[ev.type];
        var matches = [];
        if (eventTypeEvents) {
            var selectorDelegates = [];
            each(eventTypeEvents, function (delegates) {
                selectorDelegates.push(delegates);
            });
            var cur = ev.target;
            do {
                selectorDelegates.forEach(function (delegates) {
                    if (domMatches.call(cur, delegates[0].selector)) {
                        matches.push({
                            target: cur,
                            delegates: delegates
                        });
                    }
                });
                cur = cur.parentNode;
            } while (cur && cur !== ev.currentTarget);
        }
        var oldStopProp = ev.stopPropagation;
        ev.stopPropagation = function () {
            oldStopProp.apply(this, arguments);
            this.cancelBubble = true;
        };
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var delegates = match.delegates;
            for (var d = 0, dLen = delegates.length; d < dLen; d++) {
                if (delegates[d].handler.call(match.target, ev) === false) {
                    return false;
                }
                if (ev.cancelBubble) {
                    return;
                }
            }
        }
    };
    domEvents.addDelegateListener = function (eventType, selector, handler) {
        var events = domData.get.call(this, dataName), eventTypeEvents;
        if (!events) {
            domData.set.call(this, dataName, events = {});
        }
        if (!(eventTypeEvents = events[eventType])) {
            eventTypeEvents = events[eventType] = {};
            domEvents.addEventListener.call(this, eventType, handleEvent, useCapture(eventType));
        }
        if (!eventTypeEvents[selector]) {
            eventTypeEvents[selector] = [];
        }
        eventTypeEvents[selector].push({
            handler: handler,
            selector: selector
        });
    };
    domEvents.removeDelegateListener = function (eventType, selector, handler) {
        var events = domData.get.call(this, dataName);
        if (events[eventType] && events[eventType][selector]) {
            var eventTypeEvents = events[eventType], delegates = eventTypeEvents[selector], i = 0;
            while (i < delegates.length) {
                if (delegates[i].handler === handler) {
                    delegates.splice(i, 1);
                } else {
                    i++;
                }
            }
            if (delegates.length === 0) {
                delete eventTypeEvents[selector];
                if (isEmptyObject(eventTypeEvents)) {
                    domEvents.removeEventListener.call(this, eventType, handleEvent, useCapture(eventType));
                    delete events[eventType];
                    if (isEmptyObject(events)) {
                        domData.clean.call(this, dataName);
                    }
                }
            }
        }
    };
});
/*can-util@3.8.4#js/single-reference/single-reference*/
define('can-util/js/single-reference/single-reference', function (require, exports, module) {
    (function (global) {
        var CID = require('can-util/js/cid/get-cid');
        var singleReference;
        singleReference = {
            set: function (obj, key, value) {
                var keyName = CID(key);
                obj[keyName] = value;
            },
            getAndDelete: function (obj, key) {
                var cid = CID(key);
                var value = obj[cid];
                delete obj[cid];
                return value;
            }
        };
        module.exports = singleReference;
    }(function () {
        return this;
    }()));
});
/*can-util@3.8.4#dom/events/delegate/enter-leave*/
define('can-util/dom/events/delegate/enter-leave', function (require, exports, module) {
    'use strict';
    var domEvents = require('can-util/dom/events/events'), singleRef = require('can-util/js/single-reference/single-reference'), cid = require('can-util/js/cid/get-cid');
    var eventMap = {
            mouseenter: 'mouseover',
            mouseleave: 'mouseout',
            pointerenter: 'pointerover',
            pointerleave: 'pointerout'
        }, classMap = {
            mouseenter: 'MouseEvent',
            mouseleave: 'MouseEvent',
            pointerenter: 'PointerEvent',
            pointerleave: 'PointerEvent'
        }, _addDelegateListener = domEvents.addDelegateListener, _removeDelegateListener = domEvents.removeDelegateListener;
    domEvents.addDelegateListener = function (eventType, selector, handler) {
        if (eventMap[eventType] !== undefined) {
            var origHandler = handler, origType = eventType;
            eventType = eventMap[eventType];
            handler = function (event) {
                var target = this, related = event.relatedTarget;
                if (!related || related !== target && !target.contains(related)) {
                    var eventClass = classMap[origType];
                    if (eventClass === 'MouseEvent') {
                        var newEv = document.createEvent(eventClass);
                        newEv.initMouseEvent(origType, false, false, event.view, event.detail, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, event.relatedTarget);
                        event = newEv;
                    } else if (eventClass === 'PointerEvent') {
                        event = new PointerEvent(origType, event);
                    }
                    return origHandler.call(this, event);
                }
            };
            singleRef.set(origHandler, cid(this) + eventType, handler);
        }
        _addDelegateListener.call(this, eventType, selector, handler);
    };
    domEvents.removeDelegateListener = function (eventType, selector, handler) {
        if (eventMap[eventType] !== undefined) {
            eventType = eventMap[eventType];
            handler = singleRef.getAndDelete(handler, cid(this) + eventType);
        }
        _removeDelegateListener.call(this, eventType, selector, handler);
    };
});
/*can-event@3.4.0#can-event*/
define('can-event', function (require, exports, module) {
    var domEvents = require('can-util/dom/events/events');
    var CID = require('can-cid');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var namespace = require('can-namespace');
    require('can-util/dom/events/delegate/delegate');
    require('can-util/dom/events/delegate/enter-leave');
    function makeHandlerArgs(event, args) {
        if (typeof event === 'string') {
            event = { type: event };
        }
        var handlerArgs = [event];
        if (args) {
            handlerArgs.push.apply(handlerArgs, args);
        }
        return handlerArgs;
    }
    function getHandlers(eventName) {
        var events = this.__bindEvents;
        if (!events) {
            return;
        }
        return events[eventName];
    }
    var canEvent = {
        addEventListener: function (event, handler) {
            var allEvents = this.__bindEvents || (this.__bindEvents = {}), eventList = allEvents[event] || (allEvents[event] = []);
            eventList.push(handler);
            return this;
        },
        removeEventListener: function (event, fn) {
            if (!this.__bindEvents) {
                return this;
            }
            var handlers = this.__bindEvents[event] || [], i = 0, handler, isFunction = typeof fn === 'function';
            while (i < handlers.length) {
                handler = handlers[i];
                if (isFunction && handler === fn || !isFunction && (handler.cid === fn || !fn)) {
                    handlers.splice(i, 1);
                } else {
                    i++;
                }
            }
            return this;
        },
        dispatchSync: function (event, args) {
            var handlerArgs = makeHandlerArgs(event, args);
            var handlers = getHandlers.call(this, handlerArgs[0].type);
            if (!handlers) {
                return;
            }
            handlers = handlers.slice(0);
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i].apply(this, handlerArgs);
            }
            return handlerArgs[0];
        },
        on: function (eventName, selector, handler) {
            var method = typeof selector === 'string' ? 'addDelegateListener' : 'addEventListener';
            var listenWithDOM = domEvents.canAddEventListener.call(this);
            var eventBinder = listenWithDOM ? domEvents[method] : this[method] || canEvent[method];
            return eventBinder.apply(this, arguments);
        },
        off: function (eventName, selector, handler) {
            var method = typeof selector === 'string' ? 'removeDelegateListener' : 'removeEventListener';
            var listenWithDOM = domEvents.canAddEventListener.call(this);
            var eventBinder = listenWithDOM ? domEvents[method] : this[method] || canEvent[method];
            return eventBinder.apply(this, arguments);
        },
        trigger: function () {
            var listenWithDOM = domEvents.canAddEventListener.call(this);
            var dispatch = listenWithDOM ? domDispatch : canEvent.dispatch;
            return dispatch.apply(this, arguments);
        },
        one: function (event, handler) {
            var one = function () {
                canEvent.off.call(this, event, one);
                return handler.apply(this, arguments);
            };
            canEvent.on.call(this, event, one);
            return this;
        },
        listenTo: function (other, event, handler) {
            var idedEvents = this.__listenToEvents;
            if (!idedEvents) {
                idedEvents = this.__listenToEvents = {};
            }
            var otherId = CID(other);
            var othersEvents = idedEvents[otherId];
            if (!othersEvents) {
                othersEvents = idedEvents[otherId] = {
                    obj: other,
                    events: {}
                };
            }
            var eventsEvents = othersEvents.events[event];
            if (!eventsEvents) {
                eventsEvents = othersEvents.events[event] = [];
            }
            eventsEvents.push(handler);
            canEvent.on.call(other, event, handler);
        },
        stopListening: function (other, event, handler) {
            var idedEvents = this.__listenToEvents, iterIdedEvents = idedEvents, i = 0;
            if (!idedEvents) {
                return this;
            }
            if (other) {
                var othercid = CID(other);
                (iterIdedEvents = {})[othercid] = idedEvents[othercid];
                if (!idedEvents[othercid]) {
                    return this;
                }
            }
            for (var cid in iterIdedEvents) {
                var othersEvents = iterIdedEvents[cid], eventsEvents;
                other = idedEvents[cid].obj;
                if (!event) {
                    eventsEvents = othersEvents.events;
                } else {
                    (eventsEvents = {})[event] = othersEvents.events[event];
                }
                for (var eventName in eventsEvents) {
                    var handlers = eventsEvents[eventName] || [];
                    i = 0;
                    while (i < handlers.length) {
                        if (handler && handler === handlers[i] || !handler) {
                            canEvent.off.call(other, eventName, handlers[i]);
                            handlers.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                    if (!handlers.length) {
                        delete othersEvents.events[eventName];
                    }
                }
                if (isEmptyObject(othersEvents.events)) {
                    delete idedEvents[cid];
                }
            }
            return this;
        }
    };
    canEvent.addEvent = canEvent.bind = function () {
        return canEvent.addEventListener.apply(this, arguments);
    };
    canEvent.unbind = canEvent.removeEvent = function () {
        return canEvent.removeEventListener.apply(this, arguments);
    };
    canEvent.delegate = canEvent.on;
    canEvent.undelegate = canEvent.off;
    canEvent.dispatch = canEvent.dispatchSync;
    Object.defineProperty(canEvent, 'makeHandlerArgs', {
        enumerable: false,
        value: makeHandlerArgs
    });
    Object.defineProperty(canEvent, 'handlers', {
        enumerable: false,
        value: getHandlers
    });
    Object.defineProperty(canEvent, 'flush', {
        enumerable: false,
        writable: true,
        value: function () {
        }
    });
    module.exports = namespace.event = canEvent;
});
/*can-util@3.8.4#js/last/last*/
define('can-util/js/last/last', function (require, exports, module) {
    'use strict';
    module.exports = function (arr) {
        return arr && arr[arr.length - 1];
    };
});
/*can-event@3.4.0#batch/batch*/
define('can-event/batch/batch', function (require, exports, module) {
    'use strict';
    var canEvent = require('can-event');
    var last = require('can-util/js/last/last');
    var namespace = require('can-namespace');
    var canTypes = require('can-types');
    var canDev = require('can-util/js/dev/dev');
    var canLog = require('can-util/js/log/log');
    var batchNum = 1, collectionQueue = null, queues = [], dispatchingQueues = false, makeHandlerArgs = canEvent.makeHandlerArgs, getHandlers = canEvent.handlers;
    function addToCollectionQueue(item, event, args, handlers) {
        var handlerArgs = makeHandlerArgs(event, args);
        var tasks = [];
        for (var i = 0, len = handlers.length; i < len; i++) {
            tasks[i] = [
                handlers[i],
                item,
                handlerArgs
            ];
        }
        [].push.apply(collectionQueue.tasks, tasks);
    }
    var canBatch = {
        transactions: 0,
        start: function (batchStopHandler) {
            canBatch.transactions++;
            if (canBatch.transactions === 1) {
                var queue = {
                    number: batchNum++,
                    index: 0,
                    tasks: [],
                    batchEnded: false,
                    callbacksIndex: 0,
                    callbacks: [],
                    complete: false
                };
                if (batchStopHandler) {
                    queue.callbacks.push(batchStopHandler);
                }
                collectionQueue = queue;
            }
        },
        collecting: function () {
            return collectionQueue;
        },
        dispatching: function () {
            return queues[0];
        },
        stop: function (force, callStart) {
            if (force) {
                canBatch.transactions = 0;
            } else {
                canBatch.transactions--;
            }
            if (canBatch.transactions === 0) {
                queues.push(collectionQueue);
                collectionQueue = null;
                if (!dispatchingQueues) {
                    canEvent.flush();
                }
            }
        },
        flush: function () {
            dispatchingQueues = true;
            while (queues.length) {
                var queue = queues[0];
                var tasks = queue.tasks, callbacks = queue.callbacks;
                canBatch.batchNum = queue.number;
                var len = tasks.length;
                while (queue.index < len) {
                    var task = tasks[queue.index++];
                    task[0].apply(task[1], task[2]);
                }
                if (!queue.batchEnded) {
                    queue.batchEnded = true;
                    canEvent.dispatchSync.call(canBatch, 'batchEnd', [queue.number]);
                }
                while (queue.callbacksIndex < callbacks.length) {
                    callbacks[queue.callbacksIndex++]();
                }
                if (!queue.complete) {
                    queue.complete = true;
                    canBatch.batchNum = undefined;
                    queues.shift();
                }
            }
            dispatchingQueues = false;
        },
        dispatch: function (event, args) {
            var item = this, handlers;
            if (!item.__inSetup) {
                event = typeof event === 'string' ? { type: event } : event;
                if (event.batchNum) {
                    canBatch.batchNum = event.batchNum;
                    canEvent.dispatchSync.call(item, event, args);
                } else if (collectionQueue) {
                    handlers = getHandlers.call(this, event.type);
                    if (handlers) {
                        event.batchNum = collectionQueue.number;
                        addToCollectionQueue(item, event, args, handlers);
                    }
                } else if (queues.length) {
                    handlers = getHandlers.call(this, event.type);
                    if (handlers) {
                        canBatch.start();
                        event.batchNum = collectionQueue.number;
                        addToCollectionQueue(item, event, args, handlers);
                        last(queues).callbacks.push(canBatch.stop);
                    }
                } else {
                    handlers = getHandlers.call(this, event.type);
                    if (handlers) {
                        canBatch.start();
                        event.batchNum = collectionQueue.number;
                        addToCollectionQueue(item, event, args, handlers);
                        canBatch.stop();
                    }
                }
            }
        },
        queue: function (task, inCurrentBatch) {
            if (collectionQueue) {
                collectionQueue.tasks.push(task);
            } else if (queues.length) {
                if (inCurrentBatch && queues[0].index < queues.tasks.length) {
                    queues[0].tasks.push(task);
                } else {
                    canBatch.start();
                    collectionQueue.tasks.push(task);
                    last(queues).callbacks.push(canBatch.stop);
                }
            } else {
                canBatch.start();
                collectionQueue.tasks.push(task);
                canBatch.stop();
            }
        },
        queues: function () {
            return queues;
        },
        afterPreviousEvents: function (handler) {
            this.queue([handler]);
        },
        after: function (handler) {
            var queue = collectionQueue || queues[0];
            if (queue) {
                queue.callbacks.push(handler);
            } else {
                handler({});
            }
        }
    };
    canEvent.flush = canBatch.flush;
    canEvent.dispatch = canBatch.dispatch;
    canBatch.trigger = function () {
        canLog.warn('use canEvent.dispatch instead');
        return canEvent.dispatch.apply(this, arguments);
    };
    canTypes.queueTask = canBatch.queue;
    if (namespace.batch) {
        throw new Error('You can\'t have two versions of can-event/batch/batch, check your dependencies');
    } else {
        module.exports = namespace.batch = canBatch;
    }
});
/*can-util@3.8.4#js/assign/assign*/
define('can-util/js/assign/assign', function (require, exports, module) {
    module.exports = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-symbol@1.0.0-pre.0#can-symbol*/
define('can-symbol', function (require, exports, module) {
    (function (global) {
        var CanSymbol;
        if (typeof Symbol !== 'undefined') {
            CanSymbol = Symbol;
        } else {
            var symbolNum = 0;
            CanSymbol = function CanSymbolPolyfill(description) {
                var symbolValue = '@@symbol' + symbolNum++ + description;
                var symbol = {};
                Object.defineProperties(symbol, {
                    toString: {
                        value: function () {
                            return symbolValue;
                        }
                    }
                });
                return symbol;
            };
            var descriptionToSymbol = {};
            var symbolToDescription = {};
            CanSymbol.for = function (description) {
                var symbol = descriptionToSymbol[description];
                if (!symbol) {
                    symbol = descriptionToSymbol[description] = CanSymbol(description);
                    symbolToDescription[symbol] = description;
                }
                return symbol;
            };
            CanSymbol.keyFor = function (symbol) {
                return symbolToDescription[symbol];
            };
            [
                'hasInstance',
                'isConcatSpreadable',
                'iterator',
                'match',
                'prototype',
                'replace',
                'search',
                'species',
                'split',
                'toPrimitive',
                'toStringTag',
                'unscopables'
            ].forEach(function (name) {
                CanSymbol[name] = CanSymbol.for(name);
            });
        }
        [
            'isMapLike',
            'isListLike',
            'isValueLike',
            'getOwnKeys',
            'getOwnKeyDescriptor',
            'proto',
            'getOwnEnumerableKeys',
            'hasOwnKey',
            'getValue',
            'setValue',
            'getKeyValue',
            'setKeyValue',
            'apply',
            'new',
            'onValue',
            'offValue',
            'onKeyValue',
            'offKeyValue',
            'getKeyDependencies',
            'getValueDependencies',
            'keyHasDependencies',
            'valueHasDependencies',
            'onKeys',
            'onKeysAdded',
            'onKeysRemoved'
        ].forEach(function (name) {
            CanSymbol.for('can.' + name);
        });
        module.exports = CanSymbol;
    }(function () {
        return this;
    }()));
});
/*can-reflect@1.0.0-pre.1#reflections/type/type*/
define('can-reflect/reflections/type/type', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var check = function (symbols, obj) {
        for (var i = 0, len = symbols.length; i < len; i++) {
            var value = obj[canSymbol.for(symbols[i])];
            if (value !== undefined) {
                return value;
            }
        }
    };
    function isConstructorLike(func) {
        var value = func[canSymbol.for('can.new')];
        if (value !== undefined) {
            return value;
        }
        if (typeof func !== 'function') {
            return false;
        }
        for (var prop in func.prototype) {
            return true;
        }
        return false;
    }
    function isFunctionLike(obj) {
        var result = check([
            'can.new',
            'can.apply'
        ], obj);
        if (result !== undefined) {
            return !!result;
        }
        return typeof obj === 'function';
    }
    function isPrimitive(obj) {
        var type = typeof obj;
        if (obj == null || type !== 'function' && type !== 'object') {
            return true;
        } else {
            return false;
        }
    }
    function isValueLike(obj) {
        var symbolValue;
        if (isPrimitive(obj)) {
            return true;
        }
        symbolValue = obj[canSymbol.for('can.isValueLike')];
        if (typeof symbolValue !== 'undefined') {
            return symbolValue;
        }
        var value = obj[canSymbol.for('can.getValue')];
        if (value !== undefined) {
            return !!value;
        }
    }
    function isMapLike(obj) {
        var symbolValue;
        if (isPrimitive(obj)) {
            return false;
        }
        symbolValue = obj[canSymbol.for('can.isMapLike')];
        if (typeof symbolValue !== 'undefined') {
            return symbolValue;
        }
        var value = obj[canSymbol.for('can.getKeyValue')];
        if (value !== undefined) {
            return !!value;
        }
        return true;
    }
    function isObservableLike(obj) {
        if (isPrimitive(obj)) {
            return false;
        }
        var result = check([
            'can.onValue',
            'can.onKeyValue',
            'can.onKeys',
            'can.onKeysAdded'
        ], obj);
        if (result !== undefined) {
            return !!result;
        }
    }
    function isListLike(list) {
        var symbolValue, type = typeof list;
        if (type === 'string') {
            return true;
        }
        if (isPrimitive(list)) {
            return false;
        }
        symbolValue = list[canSymbol.for('can.isListLike')];
        if (typeof symbolValue !== 'undefined') {
            return symbolValue;
        }
        var value = list[canSymbol.iterator];
        if (value !== undefined) {
            return !!value;
        }
        if (Array.isArray(list)) {
            return true;
        }
        var length = list && type !== 'boolean' && typeof list !== 'number' && 'length' in list && list.length;
        return typeof list !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in list);
    }
    var symbolStart = '@@symbol';
    function isSymbolLike(symbol) {
        if (typeof symbol === 'symbol') {
            return true;
        } else {
            return symbol.toString().substr(0, symbolStart.length) === symbolStart;
        }
    }
    module.exports = {
        isConstructorLike: isConstructorLike,
        isFunctionLike: isFunctionLike,
        isListLike: isListLike,
        isMapLike: isMapLike,
        isObservableLike: isObservableLike,
        isPrimitive: isPrimitive,
        isValueLike: isValueLike,
        isSymbolLike: isSymbolLike,
        isMoreListLikeThanMapLike: function (obj) {
            if (Array.isArray(obj)) {
                return true;
            }
            var value = obj[canSymbol.for('can.isMoreListLikeThanMapLike')];
            if (value !== undefined) {
                return value;
            }
            var isListLike = this.isListLike(obj), isMapLike = this.isMapLike(obj);
            if (isListLike && !isMapLike) {
                return true;
            } else if (!isListLike && isMapLike) {
                return false;
            }
        },
        isIteratorLike: function (obj) {
            return obj && typeof obj === 'object' && typeof obj.next === 'function' && obj.next.length === 0;
        }
    };
});
/*can-reflect@1.0.0-pre.1#reflections/call/call*/
define('can-reflect/reflections/call/call', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var typeReflections = require('can-reflect/reflections/type/type');
    module.exports = {
        call: function (func, context) {
            var args = [].slice.call(arguments, 2);
            var apply = func[canSymbol.for('can.apply')];
            if (apply) {
                return apply.call(func, context, args);
            } else {
                return func.apply(context, args);
            }
        },
        apply: function (func, context, args) {
            var apply = func[canSymbol.for('can.apply')];
            if (apply) {
                return apply.call(func, context, args);
            } else {
                return func.apply(context, args);
            }
        },
        'new': function (func) {
            var args = [].slice.call(arguments, 1);
            var makeNew = func[canSymbol.for('can.new')];
            if (makeNew) {
                return makeNew.apply(func, args);
            } else {
                var context = Object.create(func.prototype);
                var ret = func.apply(context, args);
                if (typeReflections.isPrimitive(ret)) {
                    return context;
                } else {
                    return ret;
                }
            }
        }
    };
});
/*can-reflect@1.0.0-pre.1#reflections/get-set/get-set*/
define('can-reflect/reflections/get-set/get-set', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var typeReflections = require('can-reflect/reflections/type/type');
    var setKeyValueSymbol = canSymbol.for('can.setKeyValue'), getKeyValueSymbol = canSymbol.for('can.getKeyValue'), getValueSymbol = canSymbol.for('can.getValue'), setValueSymbol = canSymbol.for('can.setValue');
    var reflections = {
        setKeyValue: function (obj, key, value) {
            if (typeof key === 'symbol') {
                obj[key] = value;
                return;
            }
            var setKeyValue = obj[setKeyValueSymbol];
            if (setKeyValue) {
                return setKeyValue.call(obj, key, value);
            } else if (typeof key !== 'symbol' && typeReflections.isSymbolLike(key)) {
                Object.defineProperty(obj, key, {
                    enumerable: false,
                    configurable: true,
                    value: value,
                    writable: true
                });
            } else {
                obj[key] = value;
            }
        },
        getKeyValue: function (obj, key) {
            var getKeyValue = obj[getKeyValueSymbol];
            if (getKeyValue) {
                return getKeyValue.call(obj, key);
            }
            return obj[key];
        },
        deleteKeyValue: function (obj, key) {
            var deleteKeyValue = obj[canSymbol.for('can.deleteKeyValue')];
            if (deleteKeyValue) {
                return deleteKeyValue.call(obj, key);
            }
            delete obj[key];
        },
        getValue: function (value) {
            if (typeReflections.isPrimitive(value)) {
                return value;
            }
            var getValue = value[getValueSymbol];
            if (getValue) {
                return getValue.call(value);
            }
            return value;
        },
        setValue: function (item, value) {
            var setValue = item && item[setValueSymbol];
            if (setValue) {
                return setValue.call(item, value);
            } else {
                throw new Error('can-reflect.setValue - Can not set value.');
            }
        }
    };
    reflections.get = reflections.getKeyValue;
    reflections.set = reflections.setKeyValue;
    reflections.delete = reflections.deleteKeyValue;
    module.exports = reflections;
});
/*can-reflect@1.0.0-pre.1#reflections/observe/observe*/
define('can-reflect/reflections/observe/observe', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var slice = [].slice;
    function makeFallback(symbolName, fallbackName) {
        return function (obj, event, handler) {
            var method = obj[canSymbol.for(symbolName)];
            if (method !== undefined) {
                return method.call(obj, event, handler);
            }
            return this[fallbackName].apply(this, arguments);
        };
    }
    function makeErrorIfMissing(symbolName, errorMessage) {
        return function (obj, arg1, arg2) {
            var method = obj[canSymbol.for(symbolName)];
            if (method !== undefined) {
                return method.call(obj, arg1, arg2);
            }
            throw new Error(errorMessage);
        };
    }
    module.exports = {
        onKeyValue: makeFallback('can.onKeyValue', 'onEvent'),
        offKeyValue: makeFallback('can.offKeyValue', 'offEvent'),
        onKeys: makeErrorIfMissing('can.onKeys', 'can-reflect: can not observe an onKeys event'),
        onKeysAdded: makeErrorIfMissing('can.onKeysAdded', 'can-reflect: can not observe an onKeysAdded event'),
        onKeysRemoved: makeErrorIfMissing('can.onKeysRemoved', 'can-reflect: can not unobserve an onKeysRemoved event'),
        getKeyDependencies: makeErrorIfMissing('can.getKeyDependencies', 'can-reflect: can not determine dependencies'),
        keyHasDependencies: makeErrorIfMissing('can.keyHasDependencies', 'can-reflect: can not determine if this has key dependencies'),
        onValue: makeErrorIfMissing('can.onValue', 'can-reflect: can not observe value change'),
        offValue: makeErrorIfMissing('can.offValue', 'can-reflect: can not unobserve value change'),
        getValueDependencies: makeErrorIfMissing('can.getValueDependencies', 'can-reflect: can not determine dependencies'),
        valueHasDependencies: makeErrorIfMissing('can.valueHasDependencies', 'can-reflect: can not determine if value has dependencies'),
        onEvent: function (obj, eventName, callback) {
            if (obj) {
                var onEvent = obj[canSymbol.for('can.onEvent')];
                if (onEvent !== undefined) {
                    return onEvent.call(obj, eventName, callback);
                } else if (obj.addEventListener) {
                    obj.addEventListener(eventName, callback);
                }
            }
        },
        offEvent: function (obj, eventName, callback) {
            if (obj) {
                var offEvent = obj[canSymbol.for('can.offEvent')];
                if (offEvent !== undefined) {
                    return offEvent.call(obj, eventName, callback);
                } else if (obj.removeEventListener) {
                    obj.removeEventListener(eventName, callback);
                }
            }
        }
    };
});
/*can-reflect@1.0.0-pre.1#reflections/shape/shape*/
define('can-reflect/reflections/shape/shape', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var getSetReflections = require('can-reflect/reflections/get-set/get-set');
    var typeReflections = require('can-reflect/reflections/type/type');
    var shapeReflections = {
        each: function (obj, callback, context) {
            if (typeReflections.isIteratorLike(obj) || typeReflections.isMoreListLikeThanMapLike(obj)) {
                return this.eachIndex(obj, callback, context);
            } else {
                return this.eachKey(obj, callback, context);
            }
        },
        eachIndex: function (list, callback, context) {
            var iter, iterator = list[canSymbol.iterator];
            if (Array.isArray(list)) {
            } else if (typeReflections.isIteratorLike(list)) {
                iter = list;
            } else if (iterator) {
                iter = iterator.call(list);
            }
            if (iter) {
                var res, index = 0;
                while (!(res = iter.next()).done) {
                    if (callback.call(context || list, res.value, index++, list) === false) {
                        break;
                    }
                }
            } else {
                for (var i = 0, len = list.length; i < len; i++) {
                    var item = list[i];
                    if (callback.call(context || item, item, i, list) === false) {
                        break;
                    }
                }
            }
            return list;
        },
        toArray: function (obj) {
            var arr = [];
            this.each(obj, function (value) {
                arr.push(value);
            });
            return arr;
        },
        eachKey: function (obj, callback, context) {
            var enumerableKeys = this.getOwnEnumerableKeys(obj);
            return this.eachIndex(enumerableKeys, function (key) {
                var value = getSetReflections.getKeyValue(obj, key);
                return callback.call(context || obj, value, key, obj);
            });
        },
        'hasOwnKey': function (obj, key) {
            var hasOwnKey = obj[canSymbol.for('can.hasOwnKey')];
            if (hasOwnKey) {
                return hasOwnKey.call(obj, key);
            }
            var getOwnKeys = obj[canSymbol.for('can.getOwnKeys')];
            if (getOwnKeys) {
                var found = false;
                this.eachIndex(getOwnKeys.call(obj), function (objKey) {
                    if (objKey === key) {
                        found = true;
                        return false;
                    }
                });
                return found;
            }
            return obj.hasOwnProperty(key);
        },
        getOwnEnumerableKeys: function (obj) {
            var getOwnEnumerableKeys = obj[canSymbol.for('can.getOwnEnumerableKeys')];
            if (getOwnEnumerableKeys) {
                return getOwnEnumerableKeys.call(obj);
            }
            if (obj[canSymbol.for('can.getOwnKeys')] && obj[canSymbol.for('can.getOwnKeyDescriptor')]) {
                var keys = [];
                this.eachIndex(this.getOwnKeys(obj), function (key) {
                    var descriptor = this.getOwnKeyDescriptor(obj, key);
                    if (descriptor.enumerable) {
                        keys.push(key);
                    }
                }, this);
                return keys;
            } else {
                return Object.keys(obj);
            }
        },
        getOwnKeys: function (obj) {
            var getOwnKeys = obj[canSymbol.for('can.getOwnKeys')];
            if (getOwnKeys) {
                return getOwnKeys.call(obj);
            } else {
                return Object.getOwnPropertyNames(obj);
            }
        },
        getOwnKeyDescriptor: function (obj, key) {
            var getOwnKeyDescriptor = obj[canSymbol.for('can.getOwnKeyDescriptor')];
            if (getOwnKeyDescriptor) {
                return getOwnKeyDescriptor.call(obj, key);
            } else {
                return Object.getOwnPropertyDescriptor(obj, key);
            }
        },
        'in': function () {
        },
        getAllEnumerableKeys: function () {
        },
        getAllKeys: function () {
        }
    };
    shapeReflections.keys = shapeReflections.getOwnEnumerableKeys;
    module.exports = shapeReflections;
});
/*can-reflect@1.0.0-pre.1#can-reflect*/
define('can-reflect', function (require, exports, module) {
    var functionReflections = require('can-reflect/reflections/call/call');
    var getSet = require('can-reflect/reflections/get-set/get-set');
    var observe = require('can-reflect/reflections/observe/observe');
    var shape = require('can-reflect/reflections/shape/shape');
    var type = require('can-reflect/reflections/type/type');
    var reflect = {};
    [
        functionReflections,
        getSet,
        observe,
        shape,
        type
    ].forEach(function (reflections) {
        for (var prop in reflections) {
            reflect[prop] = reflections[prop];
        }
    });
    module.exports = reflect;
});
/*can-util@3.8.4#js/cid-map/cid-map*/
define('can-util/js/cid-map/cid-map', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL = require('can-util/js/global/global');
        var each = require('can-util/js/each/each');
        var getCID = require('can-util/js/cid/get-cid');
        var CIDMap;
        if (GLOBAL().Map) {
            CIDMap = GLOBAL().Map;
        } else {
            var CIDMap = function () {
                this.values = {};
            };
            CIDMap.prototype.set = function (key, value) {
                this.values[getCID(key)] = {
                    key: key,
                    value: value
                };
            };
            CIDMap.prototype['delete'] = function (key) {
                var has = getCID(key) in this.values;
                if (has) {
                    delete this.values[getCID(key)];
                }
                return has;
            };
            CIDMap.prototype.forEach = function (cb, thisArg) {
                each(this.values, function (pair) {
                    return cb.call(thisArg || this, pair.value, pair.key, this);
                }, this);
            };
            CIDMap.prototype.has = function (key) {
                return getCID(key) in this.values;
            };
            CIDMap.prototype.get = function (key) {
                var obj = this.values[getCID(key)];
                return obj && obj.value;
            };
            CIDMap.prototype.clear = function (key) {
                return this.values = {};
            };
            Object.defineProperty(CIDMap.prototype, 'size', {
                get: function () {
                    var size = 0;
                    each(this.values, function () {
                        size++;
                    });
                    return size;
                }
            });
        }
        module.exports = CIDMap;
    }(function () {
        return this;
    }()));
});
/*can-observation@3.2.0-pre.13#can-observation*/
define('can-observation', function (require, exports, module) {
    (function (global) {
        require('can-event');
        var canEvent = require('can-event');
        var canBatch = require('can-event/batch/batch');
        var assign = require('can-util/js/assign/assign');
        var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
        var namespace = require('can-namespace');
        var canLog = require('can-util/js/log/log');
        var canReflect = require('can-reflect');
        var canSymbol = require('can-symbol');
        var CID = require('can-cid');
        var CIDMap = require('can-util/js/cid-map/cid-map');
        var CIDSet = require('can-util/js/cid-set/cid-set');
        function Observation(func, context, compute) {
            this.newObserved = {};
            this.oldObserved = null;
            this.func = func;
            this.context = context;
            this.compute = compute && (compute.updater || 'isObservable' in compute) ? compute : { updater: compute };
            this.isObservable = typeof compute === 'object' ? compute.isObservable : true;
            var observation = this;
            this.onDependencyChange = function (value, legacyValue) {
                observation.dependencyChange(this, value, legacyValue);
            };
            this.ignore = 0;
            this.needsUpdate = false;
            this.handlers = null;
            CID(this);
        }
        var observationStack = [];
        Observation.observationStack = observationStack;
        var remaining = {
            updates: 0,
            notifications: 0
        };
        Observation.remaining = remaining;
        assign(Observation.prototype, {
            get: function () {
                if (this.isObservable && Observation.isRecording()) {
                    Observation.add(this);
                    if (!this.bound) {
                        Observation.temporarilyBind(this);
                    }
                }
                if (this.bound) {
                    canEvent.flush();
                    if (remaining.updates) {
                        Observation.updateChildrenAndSelf(this);
                    }
                    return this.value;
                } else {
                    return this.func.call(this.context);
                }
            },
            getPrimaryDepth: function () {
                return this.compute._primaryDepth || 0;
            },
            addEdge: function (objEv) {
                if (objEv.event === 'undefined') {
                    canReflect.onValue(objEv.obj, this.onDependencyChange);
                } else {
                    canReflect.onKeyValue(objEv.obj, objEv.event, this.onDependencyChange);
                }
            },
            removeEdge: function (objEv) {
                if (objEv.event === 'undefined') {
                    canReflect.offValue(objEv.obj, this.onDependencyChange);
                } else {
                    canReflect.offKeyValue(objEv.obj, objEv.event, this.onDependencyChange);
                }
            },
            dependencyChange: function () {
                if (this.bound) {
                    if (canBatch.batchNum !== this.batchNum) {
                        Observation.registerUpdate(this, canBatch.batchNum);
                        this.batchNum = canBatch.batchNum;
                    }
                }
            },
            onDependencyChange: function (value) {
                this.dependencyChange(value);
            },
            update: function (batchNum) {
                if (this.needsUpdate) {
                    remaining.updates--;
                }
                this.needsUpdate = false;
                if (this.bound) {
                    var oldValue = this.value;
                    this.oldValue = null;
                    this.start();
                    if (oldValue !== this.value) {
                        this.compute.updater(this.value, oldValue, batchNum);
                        return true;
                    }
                }
            },
            getValueAndBind: function () {
                canLog.warn('can-observation: call start instead of getValueAndBind');
                return this.start();
            },
            start: function () {
                this.bound = true;
                this.oldObserved = this.newObserved || {};
                this.ignore = 0;
                this.newObserved = {};
                observationStack.push(this);
                this.value = this.func.call(this.context);
                observationStack.pop();
                this.updateBindings();
            },
            updateBindings: function () {
                var newObserved = this.newObserved, oldObserved = this.oldObserved, name, obEv;
                for (name in newObserved) {
                    obEv = newObserved[name];
                    if (!oldObserved[name]) {
                        this.addEdge(obEv);
                    } else {
                        oldObserved[name] = null;
                    }
                }
                for (name in oldObserved) {
                    obEv = oldObserved[name];
                    if (obEv) {
                        this.removeEdge(obEv);
                    }
                }
            },
            teardown: function () {
                canLog.warn('can-observation: call stop instead of teardown');
                return this.stop();
            },
            stop: function () {
                this.bound = false;
                for (var name in this.newObserved) {
                    var ob = this.newObserved[name];
                    this.removeEdge(ob);
                }
                this.newObserved = {};
            }
        });
        var updateOrder = [], curPrimaryDepth = Infinity, maxPrimaryDepth = 0, currentBatchNum, isUpdating = false;
        var updateUpdateOrder = function (observation) {
            var primaryDepth = observation.getPrimaryDepth();
            if (primaryDepth < curPrimaryDepth) {
                curPrimaryDepth = primaryDepth;
            }
            if (primaryDepth > maxPrimaryDepth) {
                maxPrimaryDepth = primaryDepth;
            }
            var primary = updateOrder[primaryDepth] || (updateOrder[primaryDepth] = []);
            return primary;
        };
        Observation.registerUpdate = function (observation, batchNum) {
            if (observation.needsUpdate) {
                return;
            }
            remaining.updates++;
            observation.needsUpdate = true;
            var objs = updateUpdateOrder(observation);
            objs.push(observation);
        };
        var afterCallbacks = [];
        Observation.updateAndNotify = function (ev, batchNum) {
            currentBatchNum = batchNum;
            if (isUpdating) {
                return;
            }
            isUpdating = true;
            while (true) {
                if (curPrimaryDepth <= maxPrimaryDepth) {
                    var primary = updateOrder[curPrimaryDepth];
                    var lastUpdate = primary && primary.pop();
                    if (lastUpdate) {
                        lastUpdate.update(currentBatchNum);
                    } else {
                        curPrimaryDepth++;
                    }
                } else {
                    updateOrder = [];
                    curPrimaryDepth = Infinity;
                    maxPrimaryDepth = 0;
                    isUpdating = false;
                    var afterCB = afterCallbacks;
                    afterCallbacks = [];
                    afterCB.forEach(function (cb) {
                        cb();
                    });
                    return;
                }
            }
        };
        canEvent.addEventListener.call(canBatch, 'batchEnd', Observation.updateAndNotify);
        Observation.afterUpdateAndNotify = function (callback) {
            canBatch.after(function () {
                if (isUpdating) {
                    afterCallbacks.push(callback);
                } else {
                    callback();
                }
            });
        };
        Observation.updateChildrenAndSelf = function (observation) {
            if (observation.needsUpdate) {
                return Observation.unregisterAndUpdate(observation);
            }
            var childHasChanged;
            for (var prop in observation.newObserved) {
                if (observation.newObserved[prop].obj.observation) {
                    if (Observation.updateChildrenAndSelf(observation.newObserved[prop].obj.observation)) {
                        childHasChanged = true;
                    }
                }
            }
            if (childHasChanged) {
                return observation.update(currentBatchNum);
            }
        };
        Observation.unregisterAndUpdate = function (observation) {
            var primaryDepth = observation.getPrimaryDepth();
            var primary = updateOrder[primaryDepth];
            if (primary) {
                var index = primary.indexOf(observation);
                if (index !== -1) {
                    primary.splice(index, 1);
                }
            }
            return observation.update(currentBatchNum);
        };
        Observation.add = function (obj, event) {
            var top = observationStack[observationStack.length - 1];
            if (top && !top.ignore) {
                var evStr = event + '', name = obj._cid + '|' + evStr;
                if (top.traps) {
                    top.traps.push({
                        obj: obj,
                        event: evStr,
                        name: name
                    });
                } else {
                    top.newObserved[name] = {
                        obj: obj,
                        event: evStr
                    };
                }
            }
        };
        Observation.addAll = function (observes) {
            var top = observationStack[observationStack.length - 1];
            if (top) {
                if (top.traps) {
                    top.traps.push.apply(top.traps, observes);
                } else {
                    for (var i = 0, len = observes.length; i < len; i++) {
                        var trap = observes[i], name = trap.name;
                        if (!top.newObserved[name]) {
                            top.newObserved[name] = trap;
                        }
                    }
                }
            }
        };
        Observation.ignore = function (fn) {
            return function () {
                if (observationStack.length) {
                    var top = observationStack[observationStack.length - 1];
                    top.ignore++;
                    var res = fn.apply(this, arguments);
                    top.ignore--;
                    return res;
                } else {
                    return fn.apply(this, arguments);
                }
            };
        };
        Observation.trap = function () {
            if (observationStack.length) {
                var top = observationStack[observationStack.length - 1];
                var oldTraps = top.traps;
                var traps = top.traps = [];
                return function () {
                    top.traps = oldTraps;
                    return traps;
                };
            } else {
                return function () {
                    return [];
                };
            }
        };
        Observation.trapsCount = function () {
            if (observationStack.length) {
                var top = observationStack[observationStack.length - 1];
                return top.traps.length;
            } else {
                return 0;
            }
        };
        Observation.isRecording = function () {
            var len = observationStack.length;
            var last = len && observationStack[len - 1];
            return last && last.ignore === 0 && last;
        };
        var noop = function () {
        };
        var observables;
        var unbindComputes = function () {
            for (var i = 0, len = observables.length; i < len; i++) {
                canReflect.offValue(observables[i], noop);
            }
            observables = null;
        };
        Observation.temporarilyBind = function (compute) {
            var computeInstance = compute.computeInstance || compute;
            canReflect.onValue(computeInstance, noop);
            if (!observables) {
                observables = [];
                setTimeout(unbindComputes, 10);
            }
            observables.push(computeInstance);
        };
        var callHandlers = function (newValue) {
            this.handlers.forEach(function (handler) {
                canBatch.queue([
                    handler,
                    this.compute,
                    [newValue]
                ]);
            }, this);
        };
        canReflect.set(Observation.prototype, canSymbol.for('can.onValue'), function (handler) {
            if (!this.handlers) {
                this.handlers = [];
                this.compute.updater = callHandlers.bind(this);
                this.start();
            }
            this.handlers.push(handler);
        });
        canReflect.set(Observation.prototype, canSymbol.for('can.offValue'), function (handler) {
            if (this.handlers) {
                var index = this.handlers.indexOf(handler);
                this.handlers.splice(index, 1);
                if (this.handlers.length === 0) {
                    this.stop();
                }
            }
        });
        canReflect.set(Observation.prototype, canSymbol.for('can.getValue'), Observation.prototype.get);
        Observation.prototype.hasDependencies = function () {
            return this.bound ? !isEmptyObject(this.newObserved) : undefined;
        };
        canReflect.set(Observation.prototype, canSymbol.for('can.isValueLike'), true);
        canReflect.set(Observation.prototype, canSymbol.for('can.isMapLike'), false);
        canReflect.set(Observation.prototype, canSymbol.for('can.isListLike'), false);
        canReflect.set(Observation.prototype, canSymbol.for('can.valueHasDependencies'), Observation.prototype.hasDependencies);
        canReflect.set(Observation.prototype, canSymbol.for('can.getValueDependencies'), function () {
            var rets;
            if (this.bound) {
                rets = {};
                canReflect.eachKey(this.newObserved || {}, function (dep) {
                    if (canReflect.isValueLike(dep.obj)) {
                        rets.valueDependencies = rets.valueDependencies || new CIDSet();
                        rets.valueDependencies.add(dep.obj);
                    } else {
                        rets.keyDependencies = rets.keyDependencies || new CIDMap();
                        if (rets.keyDependencies.get(dep.obj)) {
                            rets.keyDependencies.get(dep.obj).push(dep.event);
                        } else {
                            rets.keyDependencies.set(dep.obj, [dep.event]);
                        }
                    }
                });
            }
            return rets;
        });
        if (namespace.Observation) {
            throw new Error('You can\'t have two versions of can-observation, check your dependencies');
        } else {
            module.exports = namespace.Observation = Observation;
        }
    }(function () {
        return this;
    }()));
});
/*can-event@3.4.0#lifecycle/lifecycle*/
define('can-event/lifecycle/lifecycle', function (require, exports, module) {
    var canEvent = require('can-event');
    var lifecycle = function (prototype) {
        var baseAddEventListener = prototype.addEventListener;
        var baseRemoveEventListener = prototype.removeEventListener;
        prototype.addEventListener = function () {
            var ret = baseAddEventListener.apply(this, arguments);
            if (!this.__inSetup) {
                this.__bindEvents = this.__bindEvents || {};
                if (!this.__bindEvents._lifecycleBindings) {
                    this.__bindEvents._lifecycleBindings = 1;
                    if (this._eventSetup) {
                        this._eventSetup();
                    }
                } else {
                    this.__bindEvents._lifecycleBindings++;
                }
            }
            return ret;
        };
        prototype.removeEventListener = function (event, handler) {
            if (!this.__bindEvents) {
                return this;
            }
            var handlers = this.__bindEvents[event] || [];
            var handlerCount = handlers.length;
            var ret = baseRemoveEventListener.apply(this, arguments);
            if (this.__bindEvents._lifecycleBindings === null) {
                this.__bindEvents._lifecycleBindings = 0;
            } else {
                this.__bindEvents._lifecycleBindings -= handlerCount - handlers.length;
            }
            if (!this.__bindEvents._lifecycleBindings && this._eventTeardown) {
                this._eventTeardown();
            }
            return ret;
        };
        return prototype;
    };
    var baseEvents = lifecycle({
        addEventListener: canEvent.addEventListener,
        removeEventListener: canEvent.removeEventListener
    });
    lifecycle.addAndSetup = baseEvents.addEventListener;
    lifecycle.removeAndTeardown = baseEvents.removeEventListener;
    module.exports = lifecycle;
});
/*can-util@3.8.4#js/is-promise-like/is-promise-like*/
define('can-util/js/is-promise-like/is-promise-like', function (require, exports, module) {
    'use strict';
    module.exports = function (obj) {
        return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    };
});
/*can-observation@3.2.0-pre.13#reader/reader*/
define('can-observation/reader/reader', function (require, exports, module) {
    var Observation = require('can-observation');
    var assign = require('can-util/js/assign/assign');
    var CID = require('can-cid');
    var types = require('can-types');
    var dev = require('can-util/js/dev/dev');
    var canEvent = require('can-event');
    var each = require('can-util/js/each/each');
    var canSymbol = require('can-symbol');
    var canReflect = require('can-reflect');
    var isPromiseLike = require('can-util/js/is-promise-like/is-promise-like');
    var getValueSymbol = canSymbol.for('can.getValue');
    var isValueLikeSymbol = canSymbol.for('can.isValueLike');
    var observeReader;
    var isAt = function (index, reads) {
        var prevRead = reads[index - 1];
        return prevRead && prevRead.at;
    };
    var readValue = function (value, index, reads, options, state, prev) {
        var usedValueReader;
        do {
            usedValueReader = false;
            for (var i = 0, len = observeReader.valueReaders.length; i < len; i++) {
                if (observeReader.valueReaders[i].test(value, index, reads, options)) {
                    value = observeReader.valueReaders[i].read(value, index, reads, options, state, prev);
                }
            }
        } while (usedValueReader);
        return value;
    };
    var specialRead = {
        index: true,
        key: true,
        event: true,
        element: true,
        viewModel: true
    };
    var checkForObservableAndNotify = function (options, state, getObserves, value, index) {
        if (options.foundObservable && !state.foundObservable) {
            if (Observation.trapsCount()) {
                Observation.addAll(getObserves());
                options.foundObservable(value, index);
                state.foundObservable = true;
            }
        }
    };
    observeReader = {
        read: function (parent, reads, options) {
            options = options || {};
            var state = { foundObservable: false };
            var getObserves;
            if (options.foundObservable) {
                getObserves = Observation.trap();
            }
            var cur = readValue(parent, 0, reads, options, state), type, prev, readLength = reads.length, i = 0, last;
            checkForObservableAndNotify(options, state, getObserves, parent, 0);
            while (i < readLength) {
                prev = cur;
                for (var r = 0, readersLength = observeReader.propertyReaders.length; r < readersLength; r++) {
                    var reader = observeReader.propertyReaders[r];
                    if (reader.test(cur)) {
                        cur = reader.read(cur, reads[i], i, options, state);
                        break;
                    }
                }
                checkForObservableAndNotify(options, state, getObserves, prev, i);
                last = cur;
                i = i + 1;
                cur = readValue(cur, i, reads, options, state, prev);
                checkForObservableAndNotify(options, state, getObserves, prev, i - 1);
                type = typeof cur;
                if (i < reads.length && (cur === null || cur === undefined)) {
                    if (options.earlyExit) {
                        options.earlyExit(prev, i - 1, cur);
                    }
                    return {
                        value: undefined,
                        parent: prev
                    };
                }
            }
            if (cur === undefined) {
                if (options.earlyExit) {
                    options.earlyExit(prev, i - 1);
                }
            }
            return {
                value: cur,
                parent: prev
            };
        },
        get: function (parent, reads, options) {
            return observeReader.read(parent, observeReader.reads(reads), options || {}).value;
        },
        valueReadersMap: {},
        valueReaders: [
            {
                name: 'function',
                test: function (value, i, reads, options) {
                    return types.isCallableForValue(value) && !types.isCompute(value);
                },
                read: function (value, i, reads, options, state, prev) {
                    if (isAt(i, reads)) {
                        return i === reads.length ? value.bind(prev) : value;
                    } else if (options.callMethodsOnObservables && types.isMapLike(prev)) {
                        return value.apply(prev, options.args || []);
                    } else if (options.isArgument && i === reads.length) {
                        return options.proxyMethods !== false ? value.bind(prev) : value;
                    }
                    return value.apply(prev, options.args || []);
                }
            },
            {
                name: 'isValueLike',
                test: function (value, i, reads, options) {
                    return value && value[getValueSymbol] && value[isValueLikeSymbol] !== false && (options.foundAt || !isAt(i, reads));
                },
                read: function (value, i, reads, options, state) {
                    if (options.readCompute === false && i === reads.length) {
                        return value;
                    }
                    return canReflect.getValue(value);
                },
                write: function (base, newVal) {
                    if (base.set) {
                        base.set(newVal);
                    } else {
                        base(newVal);
                    }
                }
            }
        ],
        propertyReadersMap: {},
        propertyReaders: [
            {
                name: 'map',
                test: function (value) {
                    return canReflect.isObservableLike(value) && canReflect.isMapLike(value);
                },
                read: function (value, prop, index, options, state) {
                    var res = canReflect.getKeyValue(value, prop.key);
                    if (res !== undefined) {
                        return res;
                    } else {
                        return value[prop.key];
                    }
                },
                write: canReflect.setKeyValue
            },
            {
                name: 'promise',
                test: function (value) {
                    return isPromiseLike(value);
                },
                read: function (value, prop, index, options, state) {
                    var observeData = value.__observeData;
                    if (!value.__observeData) {
                        observeData = value.__observeData = {
                            isPending: true,
                            state: 'pending',
                            isResolved: false,
                            isRejected: false,
                            value: undefined,
                            reason: undefined
                        };
                        CID(observeData);
                        assign(observeData, canEvent);
                        value.then(function (value) {
                            observeData.isPending = false;
                            observeData.isResolved = true;
                            observeData.value = value;
                            observeData.state = 'resolved';
                            observeData.dispatch('state', [
                                'resolved',
                                'pending'
                            ]);
                        }, function (reason) {
                            observeData.isPending = false;
                            observeData.isRejected = true;
                            observeData.reason = reason;
                            observeData.state = 'rejected';
                            observeData.dispatch('state', [
                                'rejected',
                                'pending'
                            ]);
                        });
                    }
                    Observation.add(observeData, 'state');
                    return prop.key in observeData ? observeData[prop.key] : value[prop.key];
                }
            },
            {
                name: 'object',
                test: function () {
                    return true;
                },
                read: function (value, prop, i, options) {
                    if (value == null) {
                        return undefined;
                    } else {
                        if (typeof value === 'object') {
                            if (prop.key in value) {
                                return value[prop.key];
                            } else if (prop.at && specialRead[prop.key] && '@' + prop.key in value) {
                                options.foundAt = true;
                                return value['@' + prop.key];
                            }
                        } else {
                            return value[prop.key];
                        }
                    }
                },
                write: function (base, prop, newVal) {
                    base[prop] = newVal;
                }
            }
        ],
        reads: function (keyArg) {
            var key = '' + keyArg;
            var keys = [];
            var last = 0;
            var at = false;
            if (key.charAt(0) === '@') {
                last = 1;
                at = true;
            }
            var keyToAdd = '';
            for (var i = last; i < key.length; i++) {
                var character = key.charAt(i);
                if (character === '.' || character === '@') {
                    if (key.charAt(i - 1) !== '\\') {
                        keys.push({
                            key: keyToAdd,
                            at: at
                        });
                        at = character === '@';
                        keyToAdd = '';
                    } else {
                        keyToAdd = keyToAdd.substr(0, keyToAdd.length - 1) + '.';
                    }
                } else {
                    keyToAdd += character;
                }
            }
            keys.push({
                key: keyToAdd,
                at: at
            });
            return keys;
        },
        write: function (parent, key, value, options) {
            var keys = typeof key === 'string' ? observeReader.reads(key) : key;
            var last;
            options = options || {};
            if (keys.length > 1) {
                last = keys.pop();
                parent = observeReader.read(parent, keys, options).value;
                keys.push(last);
            } else {
                last = keys[0];
            }
            if (observeReader.valueReadersMap.isValueLike.test(parent[last.key], keys.length - 1, keys, options)) {
                observeReader.valueReadersMap.isValueLike.write(parent[last.key], value, options);
            } else {
                if (observeReader.valueReadersMap.isValueLike.test(parent, keys.length - 1, keys, options)) {
                    parent = parent();
                }
                if (observeReader.propertyReadersMap.map.test(parent)) {
                    observeReader.propertyReadersMap.map.write(parent, last.key, value, options);
                } else if (observeReader.propertyReadersMap.object.test(parent)) {
                    observeReader.propertyReadersMap.object.write(parent, last.key, value, options);
                    if (options.observation) {
                        options.observation.update();
                    }
                }
            }
        }
    };
    each(observeReader.propertyReaders, function (reader) {
        observeReader.propertyReadersMap[reader.name] = reader;
    });
    each(observeReader.valueReaders, function (reader) {
        observeReader.valueReadersMap[reader.name] = reader;
    });
    observeReader.set = observeReader.write;
    module.exports = observeReader;
});
/*can-util@3.9.0-pre.0#js/is-container/is-container*/
define('can-util/js/is-container/is-container', function (require, exports, module) {
    'use strict';
    module.exports = function (current) {
        return /^f|^o/.test(typeof current);
    };
});
/*can-util@3.9.0-pre.0#js/get/get*/
define('can-util/js/get/get', function (require, exports, module) {
    'use strict';
    var isContainer = require('can-util/js/is-container/is-container');
    function get(obj, name) {
        var parts = typeof name !== 'undefined' ? (name + '').replace(/\[/g, '.').replace(/]/g, '').split('.') : [], length = parts.length, current, i, container;
        if (!length) {
            return obj;
        }
        current = obj;
        for (i = 0; i < length && isContainer(current); i++) {
            container = current;
            current = container[parts[i]];
        }
        return current;
    }
    module.exports = get;
});
/*can-util@3.9.0-pre.0#js/assign/assign*/
define('can-util/js/assign/assign', function (require, exports, module) {
    module.exports = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-util@3.9.0-pre.0#js/log/log*/
define('can-util/js/log/log', function (require, exports, module) {
    'use strict';
    exports.warnTimeout = 5000;
    exports.logLevel = 0;
    exports.warn = function (out) {
        var ll = this.logLevel;
        if (ll < 2) {
            Array.prototype.unshift.call(arguments, 'WARN:');
            if (typeof console !== 'undefined' && console.warn) {
                this._logger('warn', Array.prototype.slice.call(arguments));
            } else if (typeof console !== 'undefined' && console.log) {
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS WARNING: ' + out);
            }
        }
    };
    exports.log = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.log) {
                Array.prototype.unshift.call(arguments, 'INFO:');
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS INFO: ' + out);
            }
        }
    };
    exports.error = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.error) {
                Array.prototype.unshift.call(arguments, 'ERROR:');
                this._logger('error', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('ERROR: ' + out);
            }
        }
    };
    exports._logger = function (type, arr) {
        try {
            console[type].apply(console, arr);
        } catch (e) {
            console[type](arr);
        }
    };
});
/*can-util@3.9.0-pre.0#js/global/global*/
define('can-util/js/global/global', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL;
        module.exports = function (setGlobal) {
            if (setGlobal !== undefined) {
                GLOBAL = setGlobal;
            }
            if (GLOBAL) {
                return GLOBAL;
            } else {
                return GLOBAL = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : typeof process === 'object' && {}.toString.call(process) === '[object process]' ? global : window;
            }
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.0#js/is-array-like/is-array-like*/
define('can-util/js/is-array-like/is-array-like', function (require, exports, module) {
    'use strict';
    function isArrayLike(obj) {
        var type = typeof obj;
        if (type === 'string') {
            return true;
        } else if (type === 'number') {
            return false;
        }
        var length = obj && type !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof obj !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    }
    module.exports = isArrayLike;
});
/*can-util@3.9.0-pre.0#js/is-iterable/is-iterable*/
define('can-util/js/is-iterable/is-iterable', function (require, exports, module) {
    'use strict';
    var types = require('can-types');
    module.exports = function (obj) {
        return obj && !!obj[types.iterator];
    };
});
/*can-util@3.9.0-pre.0#js/each/each*/
define('can-util/js/each/each', function (require, exports, module) {
    'use strict';
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    var has = Object.prototype.hasOwnProperty;
    var isIterable = require('can-util/js/is-iterable/is-iterable');
    var types = require('can-types');
    function each(elements, callback, context) {
        var i = 0, key, len, item;
        if (elements) {
            if (isArrayLike(elements)) {
                for (len = elements.length; i < len; i++) {
                    item = elements[i];
                    if (callback.call(context || item, item, i, elements) === false) {
                        break;
                    }
                }
            } else if (isIterable(elements)) {
                var iter = elements[types.iterator]();
                var res, value;
                while (!(res = iter.next()).done) {
                    value = res.value;
                    callback.call(context || elements, Array.isArray(value) ? value[1] : value, value[0]);
                }
            } else if (typeof elements === 'object') {
                for (key in elements) {
                    if (has.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                        break;
                    }
                }
            }
        }
        return elements;
    }
    module.exports = each;
});
/*can-util@3.9.0-pre.0#js/is-empty-object/is-empty-object*/
define('can-util/js/is-empty-object/is-empty-object', function (require, exports, module) {
    'use strict';
    module.exports = function (obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    };
});
/*can-util@3.9.0-pre.0#dom/data/core*/
define('can-util/dom/data/core', function (require, exports, module) {
    'use strict';
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var data = {};
    var expando = 'can' + new Date();
    var uuid = 0;
    var setData = function (name, value) {
        var id = this[expando] || (this[expando] = ++uuid), store = data[id], newStore = false;
        if (!data[id]) {
            newStore = true;
            store = data[id] = {};
        }
        if (name !== undefined) {
            store[name] = value;
        }
        return newStore;
    };
    var deleteNode = function () {
        var id = this[expando];
        var nodeDeleted = false;
        if (id && data[id]) {
            nodeDeleted = true;
            delete data[id];
        }
        return nodeDeleted;
    };
    module.exports = {
        _data: data,
        getCid: function () {
            return this[expando];
        },
        cid: function () {
            return this[expando] || (this[expando] = ++uuid);
        },
        expando: expando,
        get: function (key) {
            var id = this[expando], store = id && data[id];
            return key === undefined ? store || setData(this) : store && store[key];
        },
        set: setData,
        clean: function (prop) {
            var id = this[expando];
            var itemData = data[id];
            if (itemData && itemData[prop]) {
                delete itemData[prop];
            }
            if (isEmptyObject(itemData)) {
                deleteNode.call(this);
            }
        },
        delete: deleteNode
    };
});
/*can-util@3.9.0-pre.0#js/cid/get-cid*/
define('can-util/js/cid/get-cid', function (require, exports, module) {
    'use strict';
    var CID = require('can-cid');
    var domDataCore = require('can-util/dom/data/core');
    module.exports = function (obj) {
        if (typeof obj.nodeType === 'number') {
            return domDataCore.cid.call(obj);
        } else {
            var type = typeof obj;
            var isObject = type !== null && (type === 'object' || type === 'function');
            return type + ':' + (isObject ? CID(obj) : obj);
        }
    };
});
/*can-util@3.9.0-pre.0#js/cid-set/cid-set*/
define('can-util/js/cid-set/cid-set', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL = require('can-util/js/global/global');
        var each = require('can-util/js/each/each');
        var getCID = require('can-util/js/cid/get-cid');
        var CIDSet;
        if (GLOBAL().Set) {
            CIDSet = GLOBAL().Set;
        } else {
            var CIDSet = function () {
                this.values = {};
            };
            CIDSet.prototype.add = function (value) {
                this.values[getCID(value)] = value;
            };
            CIDSet.prototype['delete'] = function (key) {
                var has = getCID(key) in this.values;
                if (has) {
                    delete this.values[getCID(key)];
                }
                return has;
            };
            CIDSet.prototype.forEach = function (cb, thisArg) {
                each(this.values, cb, thisArg);
            };
            CIDSet.prototype.has = function (value) {
                return getCID(value) in this.values;
            };
            CIDSet.prototype.clear = function (key) {
                return this.values = {};
            };
            Object.defineProperty(CIDSet.prototype, 'size', {
                get: function () {
                    var size = 0;
                    each(this.values, function () {
                        size++;
                    });
                    return size;
                }
            });
        }
        module.exports = CIDSet;
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.0#js/single-reference/single-reference*/
define('can-util/js/single-reference/single-reference', function (require, exports, module) {
    (function (global) {
        var canReflect = require('can-reflect/reflections/get-set/get-set');
        var CID = require('can-cid');
        var singleReference;
        function getKeyName(key, extraKey) {
            var keyName = extraKey ? CID(key) + ':' + extraKey : CID(key);
            return keyName || key;
        }
        singleReference = {
            set: function (obj, key, value, extraKey) {
                canReflect.set(obj, getKeyName(key, extraKey), value);
            },
            getAndDelete: function (obj, key, extraKey) {
                var keyName = getKeyName(key, extraKey);
                var value = canReflect.get(obj, keyName);
                canReflect.delete(obj, keyName);
                return value;
            }
        };
        module.exports = singleReference;
    }(function () {
        return this;
    }()));
});
/*can-compute@3.1.0-pre.11#proto-compute*/
define('can-compute/proto-compute', function (require, exports, module) {
    var Observation = require('can-observation');
    var canEvent = require('can-event');
    var eventLifecycle = require('can-event/lifecycle/lifecycle');
    require('can-event/batch/batch');
    var observeReader = require('can-observation/reader/reader');
    var getObject = require('can-util/js/get/get');
    var CID = require('can-cid');
    var assign = require('can-util/js/assign/assign');
    var types = require('can-types');
    var canLog = require('can-util/js/log/log');
    var canReflect = require('can-reflect');
    var canSymbol = require('can-symbol');
    var CIDSet = require('can-util/js/cid-set/cid-set');
    var singleReference = require('can-util/js/single-reference/single-reference');
    var Compute = function (getterSetter, context, eventName, bindOnce) {
        CID(this, 'compute');
        var args = [];
        for (var i = 0, arglen = arguments.length; i < arglen; i++) {
            args[i] = arguments[i];
        }
        var contextType = typeof args[1];
        if (typeof args[0] === 'function') {
            this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
        } else if (args[1] !== undefined) {
            if (contextType === 'string' || contextType === 'number') {
                var isListLike = types.isListLike(args[0]);
                if (types.isMapLike(args[0]) || isListLike) {
                    var map = args[0];
                    var propertyName = args[1];
                    var mapGetterSetter = function (newValue) {
                        if (arguments.length) {
                            observeReader.set(map, propertyName, newValue);
                        } else {
                            if (isListLike) {
                                observeReader.get(map, 'length');
                            }
                            return observeReader.get(map, '' + propertyName);
                        }
                    };
                    this._setupGetterSetterFn(mapGetterSetter, args[1], args[2], args[3]);
                } else {
                    this._setupProperty(args[0], args[1], args[2]);
                }
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
    var updateOnChange = function (compute, newValue, oldValue, batchNum) {
        var valueChanged = newValue !== oldValue && !(newValue !== newValue && oldValue !== oldValue);
        if (valueChanged) {
            canEvent.dispatch.call(compute, {
                type: 'change',
                batchNum: batchNum
            }, [
                newValue,
                oldValue
            ]);
        }
    };
    var setupComputeHandlers = function (compute, func, context) {
        var observation = new Observation(func, context, compute);
        compute.observation = observation;
        return {
            _on: function () {
                observation.start();
                compute.value = observation.value;
            },
            _off: function () {
                observation.stop();
            },
            getDepth: function () {
                return observation.getDepth();
            }
        };
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
            var self = this, handler;
            handler = function () {
                self.updater(self._get(), self.value);
            };
            this._get = function () {
                return getObject(target, propertyName);
            };
            this._set = function (value) {
                var properties = propertyName.split('.'), leafPropertyName = properties.pop(), targetProperty = getObject(target, properties.join('.'));
                targetProperty[leafPropertyName] = value;
            };
            this._on = function (update) {
                canEvent.on.call(target, eventName || propertyName, handler);
                this.value = this._get();
            };
            this._off = function () {
                return canEvent.off.call(target, eventName || propertyName, handler);
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
            var getter = settings.fn;
            var bindings;
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
            if (getter.length === 0) {
                bindings = setupComputeHandlers(this, getter, settings.context);
            } else if (getter.length === 1) {
                bindings = setupComputeHandlers(this, function () {
                    return getter.call(settings.context, self.lastSetValue.get());
                }, settings);
            } else {
                var oldUpdater = this.updater, resolve = Observation.ignore(function (newVal) {
                        oldUpdater.call(self, newVal, self.value);
                    });
                this.updater = function (newVal) {
                    oldUpdater.call(self, newVal, self.value);
                };
                bindings = setupComputeHandlers(this, function () {
                    var res = getter.call(settings.context, self.lastSetValue.get(), resolve);
                    return res !== undefined ? res : this.value;
                }, this);
            }
            assign(this, bindings);
        },
        _setupSimpleValue: function (initialValue) {
            this.value = initialValue;
        },
        _eventSetup: Observation.ignore(function () {
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
            var recordingObservation = Observation.isRecording();
            if (recordingObservation && this._canObserve !== false) {
                Observation.add(this, 'change');
                if (!this.bound) {
                    Compute.temporarilyBind(this);
                }
            }
            if (this.bound) {
                if (this.observation) {
                    return this.observation.get();
                } else {
                    return this.value;
                }
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
            this.updater(setVal === undefined ? this._get() : setVal, old);
            return this.value;
        },
        _set: function (newVal) {
            return this.value = newVal;
        },
        updater: function (newVal, oldVal, batchNum) {
            this.value = newVal;
            if (this.observation) {
                this.observation.value = newVal;
            }
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
    var hasDependencies = function () {
        return this.observation && this.observation.hasDependencies();
    };
    Object.defineProperty(Compute.prototype, 'hasDependencies', { get: hasDependencies });
    canReflect.set(Compute.prototype, canSymbol.for('can.valueHasDependencies'), hasDependencies);
    Compute.prototype.on = Compute.prototype.bind = Compute.prototype.addEventListener;
    Compute.prototype.off = Compute.prototype.unbind = Compute.prototype.removeEventListener;
    canReflect.set(Compute.prototype, canSymbol.for('can.onValue'), function (handler) {
        var translationHandler = function (ev, newValue) {
            handler(newValue);
        };
        singleReference.set(handler, this, translationHandler);
        this.addEventListener('change', translationHandler);
    });
    canReflect.set(Compute.prototype, canSymbol.for('can.offValue'), function (handler) {
        this.removeEventListener('change', singleReference.getAndDelete(handler, this));
    });
    canReflect.set(Compute.prototype, canSymbol.for('can.getValue'), Compute.prototype.get);
    canReflect.set(Compute.prototype, canSymbol.for('can.setValue'), Compute.prototype.set);
    Compute.temporarilyBind = Observation.temporarilyBind;
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
    canReflect.set(Compute.prototype, canSymbol.for('can.setValue'), Compute.prototype.set);
    canReflect.set(Compute.prototype, canSymbol.for('can.isValueLike'), true);
    canReflect.set(Compute.prototype, canSymbol.for('can.isMapLike'), false);
    canReflect.set(Compute.prototype, canSymbol.for('can.isListLike'), false);
    canReflect.set(Compute.prototype, canSymbol.for('can.valueHasDependencies'), function () {
        return !!this.observation;
    });
    canReflect.set(Compute.prototype, canSymbol.for('can.getValueDependencies'), function () {
        var ret;
        if (this.observation) {
            ret = { valueDependencies: new CIDSet() };
            ret.valueDependencies.add(this.observation);
        }
        return ret;
    });
    module.exports = exports = Compute;
});
/*can-compute@3.1.0-pre.11#can-compute*/
define('can-compute', function (require, exports, module) {
    require('can-event');
    require('can-event/batch/batch');
    var Compute = require('can-compute/proto-compute');
    var CID = require('can-cid');
    var namespace = require('can-namespace');
    var singleReference = require('can-util/js/single-reference/single-reference');
    var canReflect = require('can-reflect/reflections/get-set/get-set');
    var canSymbol = require('can-symbol');
    var canOnValueSymbol = canSymbol.for('can.onValue'), canOffValueSymbol = canSymbol.for('can.offValue'), canGetValue = canSymbol.for('can.getValue'), canSetValue = canSymbol.for('can.setValue'), isValueLike = canSymbol.for('can.isValueLike'), isMapLike = canSymbol.for('can.isMapLike'), isListLike = canSymbol.for('can.isListLike'), canValueHasDependencies = canSymbol.for('can.valueHasDependencies'), canGetValueDependencies = canSymbol.for('can.getValueDependencies');
    var addEventListener = function (ev, handler) {
        var compute = this;
        var translationHandler;
        if (handler) {
            translationHandler = function () {
                handler.apply(compute, arguments);
            };
            singleReference.set(handler, this, translationHandler);
        }
        return compute.computeInstance.addEventListener(ev, translationHandler);
    };
    var removeEventListener = function (ev, handler) {
        return this.computeInstance.removeEventListener(ev, handler && singleReference.getAndDelete(handler, this));
    };
    var onValue = function (handler) {
            return this.computeInstance[canOnValueSymbol](handler);
        }, offValue = function (handler) {
            return this.computeInstance[canOffValueSymbol](handler);
        }, getValue = function () {
            return this.computeInstance.get();
        }, setValue = function (value) {
            return this.computeInstance.set(value);
        }, hasDependencies = function () {
            return this.computeInstance.hasDependencies;
        }, getDependencies = function () {
            return this.computeInstance[canGetValueDependencies]();
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
        canReflect.set(compute, canOnValueSymbol, onValue);
        canReflect.set(compute, canOffValueSymbol, offValue);
        canReflect.set(compute, canGetValue, getValue);
        canReflect.set(compute, canSetValue, setValue);
        canReflect.set(compute, isValueLike, true);
        canReflect.set(compute, isMapLike, false);
        canReflect.set(compute, isListLike, false);
        canReflect.set(compute, canValueHasDependencies, hasDependencies);
        canReflect.set(compute, canGetValueDependencies, getDependencies);
        return compute;
    };
    COMPUTE.truthy = function (compute) {
        return COMPUTE(function () {
            var res = compute();
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
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();