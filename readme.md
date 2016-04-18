# can-compute

[![Build Status](https://travis-ci.org/canjs/can-compute.png?branch=master)](https://travis-ci.org/canjs/can-compute)

compose observables

## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'can-compute';
```

### CommonJS use

Use `require` to load `can-compute` and everything else
needed to create a template that uses `can-compute`:

```js
var plugin = require("can-compute");
```

## AMD use

Configure the `can` and `jquery` paths and the `can-compute` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'can-compute',
		    	location: 'node_modules/can-compute/dist/amd',
		    	main: 'lib/can-compute'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-compute/dist/global/can-compute.js'></script>
```

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
