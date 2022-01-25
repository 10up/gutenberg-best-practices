---
sidebar_position: 6
---

# Inner Blocks

## Hook based Approach
Since WordPress 5.9 it is possible to use the `useInnerBlocksProps` hook to create inner block areas in our blocks edit function. This approach allows us to control the markup of the wrapping elements of the inner blocks which makes it much easier to have markup parity between the frontend of the site and the editor.

```jsx
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

function BlockEdit(props) {
	const blockProps = useBlockProps();
	const { children, ...innerBlocksProps } = useInnerBlocksProps(blockProps,{
		allowedBlocks: [ 'core/heading' ]
	});
	
	return (
		<section {...innerBlocksProps}>
			<h2>You can even have custom elements on the same level as your children</h2>
			{  children }
		</section>
	);
}
```

There is a lot going on here. So lets tackle each of the items individually. 
The [[useBlockProps]] hook as described earlier allows us to get access to all the attributes that the block editor needs to attach to our outer most wrapping element of our block when loaded in the editor. It contains things like data attributes for the block type, the custom clientId and many more. We need to spread all these attributes onto the wrapping element so that gutenberg recognizes our block and can attach things like the Toolbar etc to it.

The `useInnerBlocksProps` hook works in a very similar way. Instead of returning and object that contains the attributes of our wrapping element it contains the attributes that gutenberg needs to add things like the block appender etc to the element. Additionally the hook accepts a second argument which takes all the options for the inner blocks area like the allowed blocks list, initial block template and [more](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-editor/src/components/inner-blocks#props).

We can now use these two bits of information and combine them into one object which houses the attributes for both things at the same time. We do that by passing the object we get returned from the `useBlockProps` hook as the first parameter to the `useInnerBlocksProps` hook. This effectively merges the two objects and we get back one object that when spread onto an element marks it as both the blocks outermost wrapper and also the container in which to place the inner blocks. 

The final trick used in the initial example is using the fact that the object returned from the hooks is an object to our advantage. We can access individual pieces of information from this object and use them ourselves to override the core behavior. 

So by deconstructing the `children` out of the object and the rest of the properties to a different object we can manually place the children in our markup. We still need to place them inside of the inner blocks wrapper because that is where gutenberg expects them to be. But we can use this to add additional elements that are not blocks into the inner blocks container. 

## Component based Approach
Before the `useInnerBlocksProps` hook was introduced the only way to work with inner blocks was to import the `InnerBlocks` component from the `@wordpress/block-editor` package. 

It accepts all the same arguments as the second parameter of the hook and allows you to place the inner blocks area anywhere inside of your markup.

```jsx title="edit.js"
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

function BlockEdit(props) {
	const blockProps = useBlockProps();
	
	return (
		<section {...blockProps}>
			<InnerBlocks
				allowedBlocks={ [ 'core/heading' ] }
			/>
		</section>
	);
}
```

The downside of using the component is that the editor adds two levels of additional divs to the editor markup in order to get the inner blocks to render correctly. This limitation makes it much more difficult to style inner block areas because you cannot _just_ apply the same styling as the frontend but instead need to write custom overrides for the editor. 

## Saving the content of our InnerBlocks
When you are used to working with dynamic blocks you will very commonly see `save` methods that just return `null` this causes a few issues that will need to be addressed in a different module but for InnerBlocks not having them in the save method means that they don't get saved at all. 
The content of an inner blocks area is not an attribute of the block. Instead the content is already serialized html which needs to be saved to the database. Therefore if nothing else our save method needs to return the `<InnerBlocks.Content />` component so that it is saved to the database.

## Server Side Rendering
In our PHP `render_callback` we can access the serialized html data which was stored in the database via the second parameter that gets passed to the `render_callback` function. It is a string that can be considered save. We therefore should not run the content through additional sanitization functions as this is going to break elements like embed blocks and cause other undesired results. 
```php
<?php 
block_renderer( $attributes, $content, $block_class ) {
	ob_start();
	?>
	<div class="wrapper">
		<?php
		/*
		 * the block_content is the html generated from innerBlocks
		 * it is being created from the save method in JS or the render_callback
		 * in php and is sanitized.
		 *
		 * Re sanitization it through `wp_kses_post` causes
		 * embed blocks to break and other core filters don't apply.
		 * therefore no additional sanitization is done and it is being output as is
		 */
		echo $content; //phpcs:disable
		?>
	</div>
	<?php 
	
	return ob_get_clean();
}
```
