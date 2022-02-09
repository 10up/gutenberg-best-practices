# A Quick Guide for Gutenberg API Version 2

First of all there is no need to freak out. I know API Version 2 sounds scary like everything is changing but that is not the case. In fact if you don't want to nothing has to change. API Version 2 is opt in and therefore does not impact anything if you don't want it to. But there are good reasons why you may want to use it.

## Benefits

API Version two allows us to get rid of the additional wrapping div in the markup of the editor. Which makes matching the frontend styling in the editor much easier.

```html title="Block Markup - API Version 1"
<div id="block-4fbf940b-758f-4999-9057-b583435e7f32" tabindex="0" role="group" aria-label="Block: Example Block - APIv1" data-block="4fbf940b-758f-4999-9057-b583435e7f32" data-type="example-block/api-version-one" data-title="Example Block - APIv1" class="block-editor-block-list__block wp-block is-selected">
    <div class="wp-block-example-block-api-version-one">
        <h2>Hello World</h2>
    </div>
</div>
```

```html title="Block Markup - API Version 2"
<div id="block-535e8d0c-018f-4dd8-80b5-2e7436057497" tabindex="0" role="group" aria-label="Block: Example Block - APIv2" data-block="535e8d0c-018f-4dd8-80b5-2e7436057497" data-type="example-block/api-version-two" data-title="Example Block - APIv2" class="wp-block-example-block-api-version-two block-editor-block-list__block wp-block">
    <h2>Hello World</h2>
</div>
```

## Usage

In order get that benefit there are two things that we need to do.

1. Set the `apiVersion` property to 2 in the block registration object
2. use the `useBlockProps` hook to get the attributes needed for the block in the editor

```json title="block.json"
{
    "name": "example-block/api-version-two",
    "title": "Example Block - APIv2",
    "description": "API Version 2",
    "icon": "block-default",
    "category": "common",
    "apiVersion": 2,
}
```

```js title="edit.js"
import { useBlockProps } from '@wordpress/block-editor';

export function BlockEdit() {
    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
            <h2>Hello World</h2>
        </div>
    )
};
```

And that's it. If you are using static rendering you need to call `useBlockProps.save()` in your save method but for dynamic blocks (php rendering) nothing changes.

## Next steps

At least for me getting the markup of the editor to match with the frontend is super cool and something that I am always striving for. And one of the things that is sill a pain is working with InnerBlocks. But that is also about to change. There is a new hook called `useInnerBlocksProps` that allows us to control the markup for InnerBlock wrappers.

```js title="edit.js"
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export function BlockEdit() {
    const blockProps = useBlockProps();
    const innerBlockProps = useInnerBlocksProps();

    return (
        <div {...blockProps}>
            <div {...innerBlockProps} />
        </div>
    )
};
```

But we can take that even further. We don't even need to have them as two separate elements. We can pass blockProps as the first argument to `useInnerBlocksProps` giving us this:

```js title="edit.js"
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export function BlockEdit() {
    const blockProps = useBlockProps();
    const innerBlockProps = useInnerBlocksProps(blockProps);

    return (
        <div {...innerBlockProps} />
    )
};
```

The output created by that in the editor is this:

```html
<div id="block-01ac6f54-c7f6-4301-917e-cbd23a7e8477" tabindex="0" role="group" aria-label="Block: Example Block - APIv2 inner blocks" data-block="01ac6f54-c7f6-4301-917e-cbd23a7e8477" data-type="example-block/api-version-two-inner-blocks" data-title="Example Block - APIv2 inner blocks" class="wp-block-example-block-api-version-two-inner-blocks block-editor-block-list__block wp-block has-child-selected block-editor-block-list__layout">
    <h2 role="group" aria-multiline="true" aria-label="Block: Heading" style="white-space: pre-wrap;" class="block-editor-rich-text__editable block-editor-block-list__block wp-block is-selected rich-text" contenteditable="true" id="block-56da6e87-b521-4798-bfbc-ac82dc0da4e5" tabindex="0" data-block="56da6e87-b521-4798-bfbc-ac82dc0da4e5" data-type="core/heading" data-title="Heading">
        Hello World
    </h2>
</div>
```

Which is mind-blowing for me because we are now 100% able to replicate the markup of the frontend in the editor. Which makes styling the editor like the frontend so much easier.

If you are interested in finding our more about this you can see the implementation here: [https://github.com/WordPress/gutenberg/blob/c0ae9b28edc20b4262547297927abe007e255e24/packages/block-editor/src/components/inner-blocks/index.js#L136](https://github.com/WordPress/gutenberg/blob/c0ae9b28edc20b4262547297927abe007e255e24/packages/block-editor/src/components/inner-blocks/index.js#L136)

## Links

- [Inner Blocks Reference](../reference/03-Blocks/inner-blocks.md)
- [Block Editor Handbook - API Version Reference](https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-api-versions.md)
