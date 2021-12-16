Since WordPress 5.9 we have a new API to handle working with InnerBlocks. It is a react hook called `useInnerBlocksProps` which works very similar to the `useBlockProps` hook that was introduced with `apiVersion` 2 of blocks. 
```jsx
function BlockEdit() {

	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'custom-classname'
		},
		{
			allowedBlocks: ['example/block']
		}
	);
	
	return (
		<section {...blockProps}>
			<div {...innerBlocksProps} />
		</section>
	)

}
```

The neat thing is, since the rerurn value of the ´useInnerBlocksProps´ hook is _just_ and object we can also do this: 

```jsx
function BlockEdit() {

	const blockProps = useBlockProps();
	const {children, ...innerBlocksProps} = useInnerBlocksProps( {}, {} );
	
	return (
		<section {...blockProps}>
			<div {...innerBlocksProps}>
				<h2>This is not a block but at the same level as the inner block children</h2>
				{ children }
			</div>
		</section>
	)

}
```