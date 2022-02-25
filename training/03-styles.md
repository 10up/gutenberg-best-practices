# Lesson 3: Block styles

In many of our projects at 10up, we need to change the style of some of the core blocks that ship with the block editor. Typically, we want to remove block styles that aren't needed, or add ones that help us achieve elements of the project's design.

## Learning Outcomes

1. Learn what block styles are and how to use them
2. Learn how to register block styles
3. Learn how to unregister block styles

## What are "block styles"?

You might have noticed that some blocks have a Styles Panel in their Inspector. The core Image block, for example, comes with these two styles: `default` and `rounded`.

![ore Image block styles](/img/core-image-styles.png "Core Image block styles")

Other blocks, like the List block for example, do not ship with any styles.

## Using Styles

Imagine you were working on a project that had three image styles: square, rounded and slightly-rounded. Here's how it looks in the design:

![Core Image block styles](/img/core-image-variations.jpg "Core Image block styles")

 Out of the box, WordPress gives us two of these styles, but we don't currently have a way to achieve the "slightly rounded" image.

Here's the first two that ship with the editor:

<em>Square</em>

![Square Image block styles](/img/core-image-square.png "Square Image block styles")

<em>Rounded</em>

![Rounded Image block styles](/img/core-image-rounded.png "Rounded Image block styles")

Let's see how to add a new style — slightly-rounded!

## Add a New Style

Adding a new Style is pretty simple.

1. Create an `image.js` file in `/includes/block-styles/`. Here's the [completed example](https://gitlab.10up.com/exercises/gutenberg-lessons/-/blob/trunk/themes/10up-theme/includes/block-styles/image.js).
2. Use the `registerBlockStyle` function to select the `core/image` block, and add your custom style.
3. Add the corresponding CSS to handle the display of your new slightly-rounded Image style. The editor adds the classname `is-style-slightly-rounded` for you to use.

When we've done that, we can now use our new style and see it outputting as the design intended:

![alt text](/img/core-image-slightly-rounded.png "Slightly Rounded Image block style")

## Adding Styles to Custom Blocks

You can also add Styles to custom blocks that you create. Let's add a new style to the CTA block that we built in the previous lesson. Let's say we want to have the option of making the border super thick on our CTA block. Something like this:

![alt text](/img/cta-block-style.png "Slightly Rounded Image block style")

It looks a lot like the registering a Style for a core block. Follow the steps below to create your own custom block style. If you get stuck you can reference the same [custom block style registration](https://gitlab.10up.com/exercises/gutenberg-lessons/-/blob/trunk/themes/10up-theme/includes/block-styles/cta.js) applied to the `cta-complete` block.:

1. Create a new `cta-starter.js` file in `/includes/block-styles/`
2. Import `registerBlockStyle` from WordPress:

   ```js
   import { registerBlockStyle } from '@wordpress/blocks';
   ```

3. Create a new function, `registerCTAStarterStyles()`
4. Within this function, use the `registerBlockStyle` function to target the `gutenberg-lessons/cta-starter` block (the name to reference is found in the blocks' `block.json` file), and set the style "name" to `thick-border` and the style "label" to `Thick border`.

:::tip
Remember what we did for the core image block:

```js
function registerImageStyles() {
	registerBlockStyle('core/image', {
		name: 'slightly-rounded',
		label: 'Slightly Rounded',
	});
}
```

:::tip

5. Call the function in the WordPress.dom ready:

```js
wp.domReady(() => {
	registerCTAStarterStyles();
});
```

6. Next, we need to be sure this custom style registration is imported. See the [index.js](https://gitlab.10up.com/exercises/gutenberg-lessons/-/blob/trunk/themes/10up-theme/includes/block-styles/index.js) file found in `block-styles` and add the above file name as an import (`import './cta-starter';`);
7. Add a style using the new `is-style-thick-border` classname. This has already been done for you in the [`call-to-action.css`](https://gitlab.10up.com/exercises/gutenberg-lessons/-/blob/trunk/themes/10up-theme/assets/css/frontend/components/blocks/call-to-action.css) file.

And voila! We've added a new style for our custom block!

:::note
For training purposes, this replicates the custom styles already in place for the `cta-complete` block. This type of replication we would typically not do in a real world environment.
:::note

![alt text](/img/cta-block-thick-border.png "Thick border CTA style")

## Remove an Unwanted Style

Lots of core blocks come with styles. Depending on the client, the design, or the use case, you might want to remove any unnecessary styles. Let's use the core Pullquote block as an example — it comes with a "Solid color" Style, which we don't need.

![alt text](/img/pullquote-core-block-style.png "Slightly Rounded Image block style")

### Steps (These steps have already been done for you. Please follow along as a reference.)

1. Create a new `pullquote.js` file in `/includes/block-styles/`
2. Use the `unRegisterBlockStyle` function to select the `core/pullquote` block, and remove the "Solid color" style.
3. Import your `pullquote.js` into `/includes/block-styles/index.js`

After we've done that, we can see that the "Solid color" Style has now been removed:
![alt text](/img/pullquote-core-block-style-removed.png "Pullquote block with style removed")

## Takeaways

That's a quick tour of block Styles. Let's quickly summarize the most important takeaways:

1. The editor ships with Styles on some core blocks
2. You can remove unwanted Styles, and add new ones
3. You can style core blocks as well as your custom ones

## Next steps

1. Try adding two new styles to the core List block to allow for different list styles
2. Try adding some new styles to the core Separator block
3. Try removing existing styles on the core Button block and adding a new one

## Further reading

* [Block Styles - 10up Gutenberg Best Practices](../reference/Blocks/block-styles)
* [Block Styles - Block Editor Handbook](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-styles/)
