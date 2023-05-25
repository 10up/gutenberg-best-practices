---
sidebar_position: 10
---

# Unregister a Block

## Reference Guide WordPress Documentation:
* [unregisterBlockType](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/#unregisterblocktype)

## Use Case:
Gutenberg comes with a lot of core blocks. When creating custom builds for clients all of these core blocks are generally not needed nor should they be used by the client. In these situations it is necessary to disable the blocks from the block editor so that a user can not access them when creating new pages and posts with the block editor. This can be done using the `unregisterBlockType` function and passing in the blocks which should be disallowed within a `.js` file. 


## Code Example:
This example showcases how an array of blocks can be passed into a single function and looped through to disable multiple blocks at the same time. 

`block-filters/unregister-blocks.js`
```js
import { unregisterBlockType } from '@wordpress/blocks';

const disallowedBlocks = [
	'core/preformatted',
	'core/table',
	'core/code',
	'core/video',
	'core/verse',
	'core/avatar',
	'core/audio',
	'core/calendar',
	'core/freeform',
];

wp.domReady(() => {
	const blocks = getBlockTypes();
	blocks.forEach(({ name }) {
		if (disallowedBlocks.includes(name)) {
			unregisterBlockType(name);
		}
	});
});
```

### Another Example - Variations:
Something that also comes up all the time is the need to remove individual block variations. The core embed block for example uses block variations to expose the various embed providers as separate items in the block inserted. If a client however has strict requirements to only ever embed videos using YouTube for example, we want to hide all the other embed providers. We can achieve that using the `unregisterBlockVariation` function.

`block-variations/unregister-core-embed-variation.js`
```js
import domReady from '@wordpress/dom-ready';
import { getBlockVariations, unregisterBlockVariation } from '@wordpress/blocks';

const allowedEmbedBlocks = ['vimeo', 'youtube'];

domReady(() => {
	const embedVariations = getBlockVariations('core/embed');
	embedVariations.forEach(({name}) => {
		if (allowedEmbedBlocks.includes(name)) {
			unregisterBlockVariation('core/embed', name);
		}
	});
});
```