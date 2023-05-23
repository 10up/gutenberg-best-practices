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
```bash
const { unregisterBlockType } = wp.blocks;

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
	wp.blocks.getBlockTypes().forEach(function (blockType) {
		if (disallowedBlocks.indexOf(blockType.name) !== -1) unregisterBlockType(blockType.name);
	});
});
```

### Another Example - Variations:
In this use case only `core/embed` has many variations of embeds available to a user but per client requirements only Vimeo and YouTube should be available as other platforms are not supported.

`block-variations/unregister-core-embed-variation.js`
```bash
const allowedEmbedBlocks = ['vimeo', 'youtube'];

wp.domReady(function () {
	wp.blocks.getBlockVariations('core/embed').forEach(function (blockVariation) {
		if (allowedEmbedBlocks.indexOf(blockVariation.name) === -1) {
			wp.blocks.unregisterBlockVariation('core/embed', blockVariation.name);
		}
	});
});
```