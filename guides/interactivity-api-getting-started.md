---
sidebar_label: Interactivity API Basics
---

# Getting started with the Interactivity API

The Interactivity API was released in WordPress 6.5. It is a new way to write frontend JavaScript specifically designed for the needs of blocks.

This guide will walk you through the basics of the Interactivity API and how to get started with it.

## Pre-requisites

The Interactivity API only works in ESM (ECMAScript Modules) environments. This means that you cannot simply use it in a regular `viewScript` or JS file that you enqueue in your theme. Instead your build step needs to support this and the file needs to be loaded properly.

Luckily, both 10up-toolkit and @wordpress/scripts handle all of this for you. Just make sure that you use at least version 6.1+ of toolkit or @wordpress/scripts 27.2.0+.

### Configuring 10up-toolkit for script modules

In order for toolkit to properly output these script modules you need to enable a new feature flag in your `package.json` file. Under the `10up-toolkit` key you need to se the `useScriptModules` flag to `true`.

```json
{
	"10up-toolkit": {
		"useScriptModules": true
	}
}
```

With that set you can now start to use the `scriptModule` & `viewScriptModule` keys in `block.json` to define your module scripts. `scriptModule` is similar to `script` and will load both in the editor and on the frontend. `viewScriptModule` is similar to `viewScript` and will only load on the frontend. In 90% of cases you will want `viewScriptModule`.

If you want to load a module script that is not connected to a block you can also use the `moduleEntry` key in `package.json` to add your own custom module entrypoints:

```json
{
	"10up-toolkit": {
		"moduleEntry": {
			"my-script": "./src/my-script.js"
		}
	}
}
```

These scripts then need to get manually enqueued using the [`wp_enqueue_script_module`](https://developer.wordpress.org/reference/functions/wp_enqueue_script_module/) function.

## Writing your first Interactivity API code

Now that we are all set up we can get started writing out first Interactivity API powered code.

In this example we are going to write a simple block that renders a toggle that expands and collapses a div when a button is clicked.

First we need to tell WordPress that our block is making use of the Interactivity API by setting `supports.interactivity` to `true` in the block.json file.

```json
{
	"supports": {
		"interactivity": true
	}
}
```

This lets WordPress know that there are special html data attributes that need to get processed before the HTML is printed on the page.

Next we can setup the namespace of our interactive region. This is done by adding a `data-wp-interactive` attribute to the root element of our block.

```php
$additional_attributes = [
	'data-wp-interactive' => 'namespace/block-name',
];

?>

<div <?php echo get_block_wrapper_attributes( $additional_attributes ); ?>>
   ...
</div>
```

This namespace needs to match the namespace we use in a minute when we add out JS code.

This happens by creating a new file we can for example call `view-module.js`. (The name doesn't matter here). This file now needs to get referenced in the `viewScriptModule` key in the `block.json` file.

```json
{
	"viewScriptModule": "file:./view-module.js"
}
```

In this file we can now import the `store` function from the `@wordpress/interactivity` package and define out first custom store.

```js
import { store } from '@wordpress/interactivity';

store( 'namespace/block-name', {
	...	
} );
```

This store is now ready and connected to our block. From here we can start defining all the logic we need.

### Adding a toggle

The Interactivity API is built to be declarative. This means that you define the state of your block and the API takes care of updating the DOM for you. So the HTML you write in the `render.php` file really is the source of truth for all the markup that gets displayed. Including it's various interactive states.

This is accomplished by using special html data attributes (directives). WordPress comes with a bunch of different directives. All of then are prefixed with `data-wp-`. For example `data-wp-class--is-active` can be used to control whether or not the class `is-active` is added to an element.

```html
<div data-wp-class--is-active="context.isActive">
	...
</div>
```

In this example the `is-active` class would never get added to the div because we don't yet have our context defined. And what the `data-wp-class--` directive does is check if the value we reference is truthy and if so it adds the class we define after the `--` to the element.

To define out context we can again start in out markup. The `data-wp-context` attribute is used to define the initial state of our block. This initial state gets fully server rendered and can then get updated interactively.

```php
$additional_attributes = [
	'data-wp-interactive' => 'namespace/block-name',
	'data-wp-context'     => wp_json_encode(
		[
			'isActive' => false,
		],
		JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
	)
];
```

If you change the value of `isActive` in the context the `is-active` class will get added or removed from the div.

:::info
The Interactivity API two different ways for keeping track of state. Context is used for local state. It is only available to the block itself and any child elements. The DOM is the source of truth here.

There also is `state` which is global and shared across all instances of the block and can be accessed by other blocks as well.

In this example we are using `context` because we only need the state to be available to the block itself.

State also has one more trick up it's sleve. Unlike context, state also allows you to define derrived state. This is state that is calculated based on other state or even context values. So you can for example access the `context` inside a `state` getter and return a value based on that.
:::

### Lets make it interactive

Now that we have our context defined we can start to add some interactivity to our block. This is done by defining actions that can be triggered by the user.

```js
import { store, getContext } from '@wordpress/interactivity';

store( 'namespace/block-name', {
	actions: {
		toggle() {
			const context = getContext();
			context.isActive = ! context.isActive;
		},
	},
} );
```

In this example we define a new action called `toggle`. This action is now available to be triggered by the user. We can trigger it by adding a `data-wp-on--click` attribute to an element in our block.

```php
<?php
$additional_attributes = [
	'data-wp-interactive' => 'namespace/block-name',
	'data-wp-context'     => wp_json_encode(
		[
			'isActive' => false,
		],
		JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
	)
];

?>

<div <?php echo get_block_wrapper_attributes( $additional_attributes ); ?>>
	<button data-wp-on--click="actions.toggle">
		Toggle
	</button>
	<div data-wp-class--is-active="context.isActive">
		...
	</div>
</div>
```

This will now toggle the `isActive` state in our context and the `is-active` class will get added or removed from the div.

To make this more accessible we can also add a `data-wp-bind--` directive and bind the `aria-expanded` attribute to this same context.

```php
<?php
$additional_attributes = [
	'data-wp-interactive' => 'namespace/block-name',
	'data-wp-context'     => wp_json_encode(
		[
			'isActive' => false,
		],
		JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
	)
];

?>

<div <?php echo get_block_wrapper_attributes( $additional_attributes ); ?>>
	<button data-wp-on--click="actions.toggle">
		Toggle
	</button>
	<div data-wp-class--is-active="context.isActive" data-wp-bind--aria-expanded="context.isActive">
		...
	</div>
</div>
```

## Conclusion

The Interactivity API is a powerful new way to write frontend JavaScript for blocks. It is designed to be declarative and easy to use. This guide has shown you the basics of how to get started with the Interactivity API and how to write your first interactive block.

For more information on the Interactivity API check out the [official documentation](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/).
