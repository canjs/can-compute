# can-compute

[![Build Status](https://travis-ci.org/canjs/can-compute.png?branch=master)](https://travis-ci.org/canjs/can-compute)

Compose observables.

- <code>[__can-compute__ function](#can-compute-function)</code>
  - <code>[compute( getterSetter[, context] )](#compute-gettersetter-context-)</code>
  - <code>[compute( initialValue [, settings] )](#compute-initialvalue--settings-)</code>
  - <code>[compute( initialValue, setter(newVal,oldVal) )](#compute-initialvalue-setternewvaloldval-)</code>
  - <code>[compute( object, propertyName [, eventName] )](#compute-object-propertyname--eventname-)</code>
    - <code>[compute( [newVal] )](#compute-newval-)</code>
    - <code>[compute.async(initialValue, computed(currentValue, setValue(newValue) )](#computeasyncinitialvalue-computedcurrentvalue-setvaluenewvalue-)</code>
    - <code>[asyncComputer function(lastSetValue, setVal)](#asynccomputer-functionlastsetvalue-setval)</code>
    - <code>[computeSettings Object](#computesettings-object)</code>

## API


## <code>__can-compute__ function</code>
Create an observable value. 


### <code>compute( getterSetter[, context] )</code>


Create a compute that derives its value from [can-map]s and other [compute](#compute-newval-)s.

```js
var age = compute(32);

var nameAndAge = compute(function(){
	return "Matthew - " + age();
});

console.log(nameAndAge()); // -> Matthew - 32

age(33);

console.log(nameAndAge()); // -> Matthew - 33
```


1. __getterSetter__ <code>{function(newVal, oldVal)}</code>:
  A function that gets and optionally sets the value of the compute.
  When called with no parameters, _getterSetter_ should return the current value of the compute. When
  called with a single parameter, _getterSetter_ should arrange things so that the next read of the compute
  produces that value. This compute will automatically update its value when any [can.Map observable]
  values are read via [can-map.prototype.attr].
  
1. __context__ <code>{Object}</code>:
  The `this` to use when calling the `getterSetter` function.

- __returns__ <code>{[compute](#compute-newval-)(newVal)}</code>:
  A new compute.
  
  

### <code>compute( initialValue [, settings] )</code>


Creates a compute from a value and optionally specifies how to read, update, and 
listen to changes in dependent values. This form of compute can be used to 
create a compute that derives its value from any source.


1. __initialValue__ <code>{*}</code>:
  The initial value of the compute. If `settings` is
  not provided, the compute simply updates its value to whatever the first argument 
  to the compute is.
  
      var age = compute(30);
      age() //-> 30
      age(31) //-> fires a "change" event
  
1. __settings__ <code>{[computeSettings](#computesettings-object)}</code>:
  
  
  Configures all behaviors of the [compute](#compute-newval-). The following cross
  binds an input element to a compute:
  
      var input = document.getElementById("age")
      var value = compute("",{
  		get: function(){
  			return input.value;
  		},
  		set: function(newVal){
  			input.value = newVal;
  		},
  		on: function(updated){
  			input.addEventListener("change", updated, false);
  		},
  		off: function(updated){
  			input.removeEventListener("change", updated, false);
  		}
  	})
  
  

- __returns__ <code>{[compute](#compute-newval-)(newVal)}</code>:
  The new compute.
  
  
  

### <code>compute( initialValue, setter(newVal,oldVal) )</code>


Create a compute that has a setter that can adjust incoming new values.

    var age = compute(6,function(newVal, oldVal){
      if(!isNaN(+newVal)){
        return +newVal;
      } else {
        return oldVal;
      }
    })




1. __initialValue__ <code>{*}</code>:
  
  
  The initial value of the compute.
  
1. __setter__ <code>{function(newVal, oldVal)}</code>:
  
  
  A function that is called when a compute is called with an argument. The function is passed
  the first argumented passed to [compute](#compute-newval-) and the current value. If
  `set` returns a value, it is used to compare to the current value of the compute. Otherwise,
  `get` is called to get the current value of the compute and that value is used
  to determine if the compute has changed values.
  

- __returns__ <code>{[compute](#compute-newval-)(newVal)}</code>:
  A new compute.
  

### <code>compute( object, propertyName [, eventName] )</code>


Create a compute from an object's property value. This short-cut
signature lets you create a compute on objects that have events
that can be listened to with [can.bind].

    var input = document.getElementById('age')
    var age = compute(input,"value","change");
    
    var me = new Map({name: "Justin"});
    var name = compute(me,"name")


1. __object__ <code>{Object}</code>:
  An object that either has a `bind` method or
  a has events dispatched on it via [can.trigger].
  
1. __propertyName__ <code>{String}</code>:
  The property value to read on `object`.  The
  property will be read via `object.attr(propertyName)` or `object[propertyame]`.
  
1. __eventName__ <code>{String}</code>:
  Specifies the event name to listen
  to on `object` for `propertyName` updates.
  

- __returns__ <code>{[compute](#compute-newval-)(newVal)}</code>:
  A new compute.
  
  

#### <code>compute( [newVal] )</code>



1. __newVal__ <code>{*}</code>:
  If `compute` is called with an argument, the first argument is used
  to set the compute to a new value. This may trigger a 
  `"change"` event that can be listened for with [can.computed.bind].
  
  If the compute is called without any arguments (`compute()`), it simply returns
  the current value of the compute.
  

- __returns__ <code>{*}</code>:
  The current value of the compute.
  

#### <code>compute.async(initialValue, computed(currentValue, setValue(newValue) )</code>



1. __The__ <code>{*}</code>:
  initial value of the compute.
  
1. __computed__ <code>{[asyncComputer](#asynccomputer-functionlastsetvalue-setval)(lastSetValue, setVal)}</code>:
  A function 
  that returns the current value of the compute and can optionally later call 
  its `setValue` callback to update the value.
  

- __returns__ <code>{[compute](#compute-newval-)(newVal)}</code>:
  Returns a compute, but a compute that will 
  possibly not have the correct value unless it is bound to.
  
#### asyncComputer `{function(lastSetValue, setVal)}`


A function that determines a value for an [async compute](#computeasyncinitialvalue-computedcurrentvalue-setvaluenewvalue-).



##### <code>function(lastSetValue, setVal)</code>
The function callback to [async](#computeasyncinitialvalue-computedcurrentvalue-setvaluenewvalue-) that determines
the value of the compute.


1. __lastSetValue__ <code>{*}</code>:
  The last set value of the compute.  This should be returned
  if you are doing an in-place compute. 
  
1. __setVal__ <code>{function(newVal)}</code>:
  Called to update the value 
  of the compute at a later time. 
  

- __returns__ <code>{*}</code>:
  If a `setVal` argument is not provided, the return value
  is set as the current value of the compute.  If `setVal` is provided and
  undefined is returned, the current value remains until `setVal` is called.
  
#### computeSettings `{Object}`





##### <code>Object</code>

- __get__ <code>{function}</code>:
  A function that retrieves and returns the current value of the compute.
- __set__ <code>{function(newVal, oldVal)}</code>:
  A function that is used when setting a new value of the compute.
  
  A function that is called when a compute is called with an argument. The function is passed
  the first argumented passed to [can.computed compute] and the current value. If
  `set` returns a value, it is used to compare to the current value of the compute. Otherwise,
  `get` is called to get the current value of the compute and that value is used
  to determine if the compute has changed values.
  
  `newVal` is the value being set, while `oldVal` is the previous value in the compute.
  
- __on__ <code>{function(updated)}</code>:
  Called to setup binding to dependency events. Call `updated` when the compute's value needs to be updated.
  
- __off__ <code>{function(function)}</code>:
  Called to teardown binding.
    
## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
