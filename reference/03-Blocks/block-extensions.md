---
sidebar_position: 3
---

# Block Extensions
There is no core API for block extensions. When we refer to block extensions here, what we actually mean is using the hooks provided in the block editor to add our own custom attributes and UI to existing blocks. You can see a full list of the [available block filters in the Block Editor Handbook](https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/). 

The most commonly used filters are `blocks.registerBlockType` for adding new attributes / supports to a block, `editor.BlockEdit` for adding custom controls to the blocks toolbar or settings sidebar, `editor.BlockListBlock` for adding custom attributes to the wrapping element within the editor, and `blocks.getSaveContent.extraProps` for adding additional attributes to the wrapping element in the save method.

In order to make it easier to work with all of these filters there is a function called `registerBlockExtention` in the `10up/block-components` package. 
