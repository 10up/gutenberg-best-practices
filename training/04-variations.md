# Lesson 4: Block variations

In the last lesson, we learned how to add styles to blocks. In this lesson, we're going to learn how to organize core and custom blocks into variations for easy reuse.

## Learning Outcomes

1. Learn what block variations are and how to use them
2. Learn how to register block variations
3. Learn how to combine core and custom blocks into reusable variations

## What are "block variations"?

[Block Variations](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/) is the api that allows you to create blocks that are _similar_ to existing blocks, but have differences that you can define. You could create a variation of the Group block, for example, that has different attributes, pre-defined classnames, and even InnerBlocks.

## Exercise Overview

10up has a lot of clients in higher-ed. These clients obviously devote a lot of attention to the student application process. Imagine you're working with one of these clients and they want to re-purpose the work we did on the CTA block from [Lesson 1](02-cta-lesson.md). On most pages, they want to include this pattern of blocks: a heading, a description and two CTA blocks side by side. Here's what they want:

!["Block Variation, CTA block"](/img/variations-block-cta-1.png)

We need a way to "package up" all those elements so editors can easily insert it whenever they want. Thankfully we can, with block variations!

## Breaking it Down

For our example, we need to combine these four blocks for easy use in the editor. Let's break down what we're looking at here into actual blocks:

!["Block Variation breakdown"](/img/variations-block-cta-2.png)

On first glance, it looked like we just needed 4 blocks. But we actually need a couple of more for wrapping. Here's the breakdown:

1. A Group block to contain the whole thing
2. A Heading block
3. A Paragraph block
4. A Columns block to contain our CTA blocks
5. Our two CTA blocks

## Using Variations

Alright — let's build this thing!

:::tip
You can find a completed example in [application-ctas-example.js](https://gitlab.10up.com/exercises/gutenberg-lessons/-/tree/trunk/themes/10up-theme/includes/block-variations/application-ctas-example.js). You can also find this example using the block editor by looking in the blocks inserter under `DESIGN` as `Application CTAs Example` (or by typing `/Application CTAs Example`).
:::tip

1. First, we need to create our variations file. In the directory [block-variations](https://gitlab.10up.com/exercises/gutenberg-lessons/-/tree/trunk/themes/10up-theme/includes/block-variations) add a new file `application-ctas.js`.
2. Next, in this new file, we need to register a new variation of the group block. We first need to import the `registerBlockVariation` function

   ```js
   import { registerBlockVariation } from '@wordpress/blocks';
   ```

   then call the function and register our group block variation:

	```js
	registerBlockVariation('core/group', {
		name: 'application-ctas',
		title: 'Application CTAs',
		icon: 'block-default',
		scope: ['inserter'],
		attributes: {
			className: 'is-style-application-ctas',
		},
	});
	```

3. We now need to make sure this variation is being imported correctly and verify it displays in the admin. Open the [index.js](https://gitlab.10up.com/exercises/gutenberg-lessons/-/tree/trunk/themes/10up-theme/includes/block-variations/index.js) file inside `block-variations`. Here, you will see the import for `./application-ctas-example`. We want to replicate that import for our new file as `import './application-ctas';`. Once this is added (be sure you are running `npm run watch` in the theme to ensure your code updates), you should now find your variation in listed in the editor in the block inserter as `Application CTAs`. If you select it, it currently only outputs a core block. .
4. We need to define some structure for our variation via `innerBlocks`. We add this declaration after `attributes: {},` in our `application-ctas.js` file. This is where the real magic happens:

	```js
	innerBlocks: [
			[
				'core/heading',
				{
					level: 2, // IE: make it an <h2>
					placeholder: 'Getting started with your application',
				},
			],
			[
				'core/paragraph',
				{
					placeholder: 'Add the description text here...',
					className: 'application-ctas__description',
				}
			],
			[
				'core/columns',
				{},
				[
					['gutenberg-lessons/cta-complete', {}],
					['gutenberg-lessons/cta-complete', {}],
				],
			],
		],
	```

5. You can see that we added a custom className on the description paragraph. You could do the same for any of the attributes that a block supports. [BlockBook](https://youknowriad.github.io/blockbook/block/) is an excellent resource for seeing what attributes are available on each block to use

6. Once we've registered the block, we can now see it in the inserter:
![alt text](/img/applications-cta-inserter.png "CTA block inserter")

7. And here's our finished product:
![alt text](/img/applications-cta-blank.png "CTA block inserter")

## Takeaways

That's a quick look of block variations. Let's quickly summarize the most important takeaways:

1. You can combine core and custom blocks into variations
2. You often need to group blocks together using Group and Column blocks
3. You can change the attributes of any blocks you use — adding classes, changing placeholder text, etc

## Next Steps

1. Try to create a different layout. Perhaps a variation that places a CTA next to an image:
![alt text](/img/variations-block-next-steps-1.png "CTA + image")

2. Try having it so that the rounded image is the one that displays by default with your variation:
![alt text](/img/variations-block-next-steps-2.png "CTA + image rounded")

## Further Reading

* [Block Variations - 10up Gutenberg Best Practices](../reference/Blocks/block-variations)
* [Block Variations - Block Editor Handbook](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/)
* [How to use block variations in WordPress - CSS Tricks](https://css-tricks.com/how-to-use-block-variations-in-wordpress/)
* [Using Gutenberg Block Variations - Rich Tabor](https://richtabor.com/block-variations/)
* [BlockBook](https://youknowriad.github.io/blockbook/block/)
