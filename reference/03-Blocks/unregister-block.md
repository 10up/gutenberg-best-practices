---
sidebar_position: 10
---

# Unregister a Block and Allow List

## Reference Guide WordPress Documentation:
* [unregisterBlockType](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/#unregisterblocktype)

## Unregister Use Case:
Gutenberg comes with a lot of core blocks and this can be overwhelming for certain editors. Due to this situations arise where it is necessary to disable some blocks so that an editor can not access them when creating new pages and posts. Removing certain blocks can aid these editors by reducing cognitive load and confusion. This can be done using the `unregisterBlockType` function and passing in the blocks which should be disallowed within a `.js` file. 

## Code Example:
This example showcases how an array of blocks can be passed into a single function and looped through to disable multiple blocks at the same time. 

`block-filters/unregister-blocks.js`
```js
import domReady from '@wordpress/dom-ready';
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';

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

domReady(() => {
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

## Allow List:
Opposite to the approach of `unregisterBlockType` would be to create a PHP allow list. In this scenario a developer would curate the specific blocks that they want to have shown to an editor. In these situations it is advised to always include common utility blocks such as: `core/block`, `core/missing`, `core/pattern`, `core/template-part` to prevent issues with the block editor. 

**NOTE** - When using an allow list it is advised to review WordPress releases for any changes in existing blocks. As an example WordPress 6.1 refactored the list block from one singular block to an inner blocks structure with a list item. Anyone that used an allow list at that point needed to go in and update it to include the core/list-item block.

## Code Example:
```php
add_filter( 'allowed_block_types_all', __NAMESPACE__ . '\get_allowed_blocks', 10 );

/**
 * Returns allowed blocks.
 */
function get_allowed_blocks() {
	return [
		'core/block',
		'core/button',
		'core/buttons',
		'core/column',
		'core/columns',
		'core/cover',
		'core/embed',
		'core/group',
		'core/heading',
		'core/image',
		'core/list-item',
		'core/list',
		'core/media-text',
		'core/paragraph',
		'core/separator',
		'core/shortcode',
		'core/social-link',
		'core/social-links',
		'core/table',
		'gravityforms/form',
		'core/query',
		'core/query-pagination',
		'core/query-pagination-next',
		'core/query-pagination-numbers',
		'core/query-pagination-previous',
		'core/post-template',
	];
}
```

### Automatically Add Custom Blocks to the Allow List Snippet:
As a code base grows and more custom blocks are created this snippet is a quick way to ensure that the custom blocks that have been newly created are also added to the allow list.

```php
$block = register_block_type_from_metadata( $block_folder, $block_options );

add_filter(
	'allowed_block_types_all',
	function ( $block_list ) use ( $block ) {
		return array_merge( $block_list, [ $block->name ] );
	},
	10
);
```
