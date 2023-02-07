---
sidebar_label: Including Frontend JS with a Block
---

# Including Frontend JavaScript with a Block

Sometimes we need to include frontend JavaScript with a block. If it's only a small bit of CSS it's not a big issue to load that script on every page with the main frontend JavaScript bundle of the site.

However, as soon as you start to load larger libraries or a lot of custom JavaScript that is only needed whenever a specific block is present on the page it is bad for performance to always load that entire JS on every single page.

There are two ways we can solve this:

1. Use [dynamic imports (Webpack code splitting)](https://webpack.js.org/guides/code-splitting/)
2. Only enqueue block-specific JS when the block is present on the page

In this guide, we are taking a look at the second option as it often is the easier and more robust one of the two.

## Only enqueueing block-specific JS when the block is present on the page

To have a JavaScript file that only gets enqueued on the page if the block is present, we can define a `viewScript` in the `block.json` file. This `viewScript` can either be a relative file path to the JS file or a script handle that should get enqueued.

```json title="block.json"
{
	"apiVersion": 2,
	"name": "namespace/example",
	"title": "Example Block",
	"editorScript": "file:./index.js",
	// highlight-next-line
	"viewScript": "file:./view.js"
}
```

This automatically takes the JS file that is located at the relative file path and registers it using the `wp_register_script` function. The script gets the handle `namespace-example-view-script`. The handle is generated using the block namespace, followed by the block name, with the suffix `-view-script` added at the end.

:::note
WordPress expects a file that is provided via a relative file path to also have a `.asset.php` file next to it with the script dependencies and generated version number. Both `@wordpress/scripts` and `10up-toolkit` do this automatically for you using the `@wordpress/dependency-extraction-webpack-plugin`.
:::note

If your script relies on additional non-WordPress dependencies like a 3rd party library that cannot be installed via NPM you can also handle the registration of the view script manually and only provide the script handle you registered to the `viewScript` in the `block.json` file.

```php
$asset_file_name    = 'view-script';
$asset_dependencies = ( include NAMESPACE_PATH . "dist/$asset_file_name.asset.php" );
wp_register_script(
	'my-custom-view-script-handle',
	THEME_URL . "dist/$asset_file_name.js",
	// highlight-next-line
	array_merge( $asset_dependencies['dependencies'], [ 'custom-dependency' ] ),
	$asset_dependencies['version'],
	true
);
```

```json title="block.json"
{
	"apiVersion": 2,
	"name": "namespace/example",
	"title": "Example Block",
	"editorScript": "file:../../../dist/js/blocks/example/editor.js",
	// highlight-next-line
	"viewScript": "my-custom-view-script-handle"
}
```

:::info
Since WordPress 6.1 Dynamic blocks also automatically enqueue the JS file on all pages where the block is being used. Previously that only worked for static blocks and dynamic ones needed to manually call `wp_enqueue_script` with the auto-generated view script handle.
:::
