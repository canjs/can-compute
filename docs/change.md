@typedef {Event} can-compute.computed.ChangeEvent change
@parent can-compute/computed/events

Event fired when the value of the [can-compute.computed] changes.

```js
var age = compute(33);

age.on('change', function(){
	console.log('Now:', age());
});

age(34);
```
