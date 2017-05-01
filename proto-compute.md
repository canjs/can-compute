## <code>__proto-compute__ function</code>

## Development Methods
These methods are not available in the final distribution bundle and are thus for development purposes only.

### `.log()`
Generate and log a trace for a given instance of `Compute`.

```js
var a = new Compute('a');
var aTrace = a.log(); //-> INFO: compute1 - a
console.log(aTrace); //-> {computeValue: "a", definition: undefined, cid: "compute1"}
```

- __returns__ `{Object}`: Trace of `Compute`.

### `.trace()`
Generate a trace for a given instance of `Compute`.

```js
var a = new Compute('Hello');
var aTrace = a.trace();
console.log(aTrace); //->
// {
//     computeValue: "Hello",
//     definition: undefined,
//     cid: "compute1"
// }

var b = new Compute(fn);
var bTrace = b.trace();
console.log(bTrace); //->
// {
//     computeValue: "Hello World!",
//     cid: "compute2",
//     dependencies: Array(1),
//     definition: function
// }
console.log(bTrace.definition === fn); //-> true

function fn(){
    return a.get() + ' World!';
}
```

- __returns__ `{Object}`: Trace of `Compute`.

### Trace Object
- __computeValue__ `{Any}` Current computed value of a given `Compute` instance.
- __cid__ `{String}` Unique identifier of a given `Compute` instance.
- __dependencies__ `{Array}` List of traces for each `Compute` dependency.
- __definition__ `{Function || undefined}` Reference to the original definition function if applicable.