@function can-compute.computed.on compute().on
@parent can-compute/computed/methods


@signature `compute.on(eventType, handler)`

@param {String} eventType The name of the event to bind on, usually `change`.

@param {function(event, ...args)} handler The handler to be called when this type of event fires.

@return {can-compute.computed} The compute instance.
