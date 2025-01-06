---
sidebar_label: Block Templates
sidebar_position: 3
---

# Block Based Templates

In block-based-themes, all parts of the theme are built out of blocks. So instead of just the content area, all templates and template parts are also built via blocks.

These block templates follow the same template hierarchy as traditional themes. But instead of `index.php`, `single.php`, `page.php`, etc. we now have `templates/index.html`, `templates/single.html`, `templates/page.html`, etc.

## How to start using block templates

Technically you can start using block templates in any theme. So even in a classic theme you could start and introduce a new block based template by creating a `templates` folder in the theme root and then adding a new template file to it.

The lookup for which template gets used uses the same logic as the classic theme hierarchy just with the added complexity that it looks for `.html` files first and then falls back to the old `.php` files if it cannot find a `.html` version.

:::tip
The best experience however is when starting on a new build where all templates are built as block templates from the beginning. Because otherwise if you mix the two you will have to do manual work to share your header / footer block based template parts between the two systems.
:::

## Anatomy of a block template

A block template is a regular HTML file that contains the block markup. In order to work properly however the markup needs to be 100% valid block markup including the `<!-- wp: -->` comments.

:::caution
You cannot just use arbitrary HTML in a block template. It needs to be valid block markup.
:::

## Authoring block templates

Because they need to contain valid block markup, hand authoring these templates can be quite cumbersome. Therefore it is recommended to create the block template in the site editor itself and use the [Create Block Theme plugin](https://wordpress.org/plugins/create-block-theme/) to save all the changes you made in the editor back to the theme.

<details>
<summary>How do I translate strings in these `.html` files?</summary>

Because these are just HTML files, you can't use the `__()` function to translate strings directly. The workaround that has been established for this is to put all the contents of the template into a pattern instead which can be a `.php` file and then use the `__()` function in there. This pattern can then be referenced in the `.html` file via the `core/pattern` block.

```php title="patterns/single-post.php"
<?php
/**
 * Title: Single Post Pattern
 * Slug: single-post
 * Inserter: false
 */

?>

<!-- wp:paragraph -->
<p><?php esc_html_e( 'Hello World!', 'textdomain' ); ?></p>
<!-- /wp:paragraph -->
```

```html title="templates/single.html"
<!-- wp:pattern {"slug":"single-post"} /-->
```

Luckily, the Create Block Theme plugin does this for you automatically if you check the "Translate strings" checkbox when saving the template.

</details>

## Previewing the template in the editor

One of the benefits of block templates is that unlike traditional templates, you can preview them directly in the editor. This makes it much easier for editors to see how their changes will look on the frontend.

In the sidebar of any post you can find a setting to switch between the different templates that are available for the post type. Clicking on this dropdown also reveals a "Show Template" button that will enable the preview.

We can also enable this setting programmatically via this little snippet:

```js
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { store as editorStore } from '@wordpress/editor';

// Define post types that show the full template locked site editor by default.
const TEMPLATE_LOCKED_POST_TYPES = [
	'page',
	'post',
];

registerPlugin('set-default-template-rendering-mode', {
	render: function Edit() {
		const { setRenderingMode } = useDispatch(editorStore);

		const [postType] = useSelect((select) => [select(editorStore).getCurrentPostType()], []);

		useEffect(() => {
			if (!TEMPLATE_LOCKED_POST_TYPES.includes(postType)) {
				return;
			}
			setRenderingMode('template-locked');
		}, [setRenderingMode, postType]);

		return null;
	},
});
```

_We are working on actually allowing you to set the default rendering mode as a property of any post type server side. You can [follow along the progress on GitHub.](https://github.com/WordPress/gutenberg/issues/58038)_

### Allowing users to edit elements that are part of the template

When the "Show Preview" option is enabled, the template itself is rendered but all the blocks are locked completely and cannot be interacted with. They also don't show up in the list view.

However, some core blocks get special treatment here. If you place the Post Title, or Post Featured Image blocks inside the template for example they will remain editable. This is because these blocks are not storing their settings in an attribute but rather modify some other property of the post object. And the only thing we can edit about them is the actual "content".

So these "special" blocks get rendered in the `contentOnly` editing mode.

We can filter which blocks get this special treatment via the `editor.postContentBlockTypes` filter:

```js
import { addFilter } from '@wordpress/hooks';

addFilter('editor.postContentBlockTypes', 'namespace/identifier', (blockTypes) => {
	return [...blockTypes, 'namespace/my-block'];
});
```

If you want to learn more about making your block support the `contentOnly` rendering mode there is a great article on the WordPress Developer Block you should check out: [https://developer.wordpress.org/news/2024/11/05/how-to-add-content-only-editing-support-to-a-block/](https://developer.wordpress.org/news/2024/11/05/how-to-add-content-only-editing-support-to-a-block/)

## Choosing what's part of the template and what's not

For a while there before block based themes, we moved more and more "template elements" such as page headers etc into the actual post content area because that was the only way to create a rich editing experience for these elements.

However doing this came with several downsides such as:

- In case of a redesign we now have that page header shored in thousands of individual posts and pages which makes updating it much harder.
- We have to do custom work to ensure we are not duplicating the elements in the header when the post gets rendered in other contexts such as an RSS feed or Apple News.

Now with the ability to preview the template and also have some individual elements inside these templates still be editable we can move these elements back into the template where they belong.
