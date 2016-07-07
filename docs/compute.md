@module {function} can-compute
@parent can-core
@release 1.1
@link ../docco/compute/compute.html docco

@description Create an observable value.

@signature `compute( getterSetter[, context] )`

Create a compute that derives its value from [can-map]s and other [can-compute.computed compute]s.

```js
var age = compute(32);

var nameAndAge = compute(function(){
	return "Matthew - " + age();
});

console.log(nameAndAge()); // -> Matthew - 32

age(33);

console.log(nameAndAge()); // -> Matthew - 33
```

@param {function(*+,*+)} getterSetter(newVal,oldVal) A function that gets and optionally sets the value of the compute.
When called with no parameters, _getterSetter_ should return the current value of the compute. When
called with a single parameter, _getterSetter_ should arrange things so that the next read of the compute
produces that value. This compute will automatically update its value when any [can.Map observable]
values are read via [can-map.prototype.attr].

@param {Object} [context] The `this` to use when calling the `getterSetter` function.
@return {can-compute.computed} A new compute.


@signature `compute( initialValue [, settings] )`

Creates a compute from a value and optionally specifies how to read, update, and 
listen to changes in dependent values. This form of compute can be used to 
create a compute that derives its value from any source.

@param {*} initialValue The initial value of the compute. If `settings` is
not provided, the compute simply updates its value to whatever the first argument 
to the compute is.

    var age = compute(30);
    age() //-> 30
    age(31) //-> fires a "change" event

@param {computeSettings} [settings]

Configures all behaviors of the [can-compute.computed compute]. The following cross
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


@return {can-compute.computed} The new compute.



@signature `compute( initialValue, setter(newVal,oldVal) )`

Create a compute that has a setter that can adjust incoming new values.

    var age = compute(6,function(newVal, oldVal){
      if(!isNaN(+newVal)){
        return +newVal;
      } else {
        return oldVal;
      }
    })



@param {*} initialValue

The initial value of the compute.

@param {function(*,*):*} setter(newVal,oldVal) 

A function that is called when a compute is called with an argument. The function is passed
the first argumented passed to [can-compute.computed compute] and the current value. If
`set` returns a value, it is used to compare to the current value of the compute. Otherwise,
`get` is called to get the current value of the compute and that value is used
to determine if the compute has changed values.

@return {can-compute.computed} A new compute.

@signature `compute( object, propertyName [, eventName] )`

Create a compute from an object's property value. This short-cut
signature lets you create a compute on objects that have events
that can be listened to with [can.bind].

    var input = document.getElementById('age')
    var age = compute(input,"value","change");
    
    var me = new Map({name: "Justin"});
    var name = compute(me,"name")

@param {Object} object An object that either has a `bind` method or
a has events dispatched on it via [can.trigger].

@param {String} propertyName The property value to read on `object`.  The
property will be read via `object.attr(propertyName)` or `object[propertyame]`.

@param {String} [eventName=propertyName] Specifies the event name to listen
to on `object` for `propertyName` updates.

@return {can-compute.computed} A new compute.


@body

## Use

`compute` lets you make an observable value. Computes are similar
to [can-map Observes], but they represent a single value rather than 
a collection of values.

`compute` returns a [can-compute.computed compute] function that can 
be called to read and optionally update the compute's value.

It's also possible to derive a compute's value from other computes,
[can-map]s, and [can-list]s. When the derived values
change, the compute's value will be automatically updated.

Use [can-compute.computed.bind compute.bind] to listen for changes of the 
compute's value.

## Observing a value

The simplest way to use a compute is to have it store a single value, and to set it when
that value needs to change:


    var tally = compute(12);
    tally(); // 12
    
    tally.bind("change",function(ev, newVal, oldVal){
      console.log(newVal,oldVal)
    })
    
    tally(13);
    tally(); // 13

Any value can be observed.  The following creates a compute
that holds an object and then changes it to an array.

    var data = compute({name: "Justin"})
    data([{description: "Learn Computes"}])



## Derived computes

If you use a compute that derives its
value from properties of a [can-map] or other [compute]s, the compute will listen for changes in those
properties and automatically recalculate itself, emitting a _change_ event if its value
changes.

The following example shows creating a `fullName` compute
that derives its value from two properties on the `person` observe:


    var person = new Map({
        firstName: 'Alice',
        lastName: 'Liddell'
    });
    
    var fullName = compute(function() {
        return person.attr('firstName') + ' ' + person.attr('lastName');
    });
    fullName.bind('change', function(ev, newVal, oldVal) {
        console.log("This person's full name is now " + newVal + '.');
    });
    
    person.attr('firstName', 'Allison'); // The log reads:
    //-> "This person's full name is now Allison Liddell."


Notice how the definition of the compute uses `[can-map.prototype.attr attr]`
to read the values of the properties of `person`. This is how the compute knows to listen
for changes.

## Translator computes - computes that update their derived values

Sometimes you need a compute to be able to translate one value to another. For example,
consider a widget that displays and allows you to update the progress in percent
of a task. It accepts a compute with values between 0 and 100. But,
our task observe has progress values between 0 and 1 like:

    var task = new Map({
      progress: 0.75
    })

Use `compute( getterSetter )` to create a compute that updates itself
when task's `progress` changes, but can also update progress when
the compute function is called with a value.  For example:

    var progressPercent = compute(function(percent){
      if(arguments.length){
        task.attr('progress', percent / 100)
      } else {
        return task.attr('progress') * 100
      }
    })
    
    progressPercent() // -> 75
    
    progressPercent(100)
    
    task.attr('progress') // -> 1


The following is a similar example that shows converting feet into meters and back:

```
var wall = new Map({
    material: 'brick',
    length: 10 // in feet
});

var wallLengthInMeters = compute(function(lengthInM) {
    if(arguments.length) {
        wall.attr('length', lengthInM / 3.28084);
    } else {
        return wall.attr('length') * 3.28084;
    }
});

wallLengthInMeters(); // 3.048

// When you set the compute...
wallLengthInMeters(5);
wallLengthInMeters(); // 5
// ...the original Observe changes too.
wall.length;          // 16.4042
```

## Events

When a compute's value is changed, it emits a _change_ event. You can listen for this change
event by using `[computed.bind bind]` to bind an event handler to the compute:

```
var tally = compute(0);
tally.bind('change', function(ev, newVal, oldVal) {
    console.log('The tally is now at ' + newVal + '.');
});

tally(tally() + 5); // The log reads:
                    // 'The tally is now at 5.'
```
