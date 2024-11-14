---
sidebar_label: Fonts
sidebar_position: 5
---

# Loading Fonts using `theme.json`

## Why use `theme.json` for controlling font loading?

Using `theme.json` to handle the registration of fonts automatically makes sure the font files are properly enqueued everywhere in WordPress. It provides us with a simple API to control all aspects of how the font should get rendered and loaded. This also directly works for any iframed editors.

## How to register local font files

Most of the time we want to load custom font files that we bundle with the theme itself on the server. This is for both performance and privacy reasons. We can avoid additional requests to external servers.

Each font family we want to load needs to get it's own entry in the `settings.typography.fontFamilies` array. Each entry consists of:

- `fontFamily` - Font Family declaration like in `css`
- `name` - Human readable Name of the font family
- `slug` - Computer readable Name of the font family
- `fontFace` - Array of the individual font faces

The `fontFace` itself is another array that houses each of the individual font faces of the family. So each font weight, style etc gets added here manually.

- `fontFamily` - Name of the font family
- `fontWeight` - Weight of the current font face
- `fontStyle` - Style of the current font face
- `fontDisplay` - Font Display of the current font face
- `src` - Array of relative file paths to the individual font files of the current font face

```json
{
	"settings": {
		"typography": {
			"fontFamilies": [
				{
					"fontFamily": "FontName, sans-serif",
					"name": "FontName",
					"slug": "fontname",
					"fontFace": [
						{
							"fontFamily": "FontName",
							"fontWeight": "100",
							"fontStyle": "normal",
							"fontDisplay": "block",
							"src": [
								"file:./dist/fonts/fontname/fontname-thin.otf",
								"file:./dist/fonts/fontname/fontname-thin.woff",
								"file:./dist/fonts/fontname/fontname-thin.woff2"
							]
						},
						...
					]
				}
			]
		}
	}
}

```

The resulting output on the page will be an inline style tag with the various `@font-face` declarations:

```html
<style id="wp-webfonts-inline-css" type="text/css">
	@font-face {
		font-family:FontName;
		font-style:normal;
		font-weight:100;
		font-display:block;
		src:local(FontName), url('/wp-content/themes/tenup-theme/dist/fonts/fontname/fontname-thin.woff2') format('woff2'), url('/wp-content/themes/tenup-theme/dist/fonts/fontname/fontname-thin.woff') format('woff'), url('/wp-content/themes/tenup-theme/dist/fonts/fontname/fontname-thin.otf') format('opentype');
	}

	...
</style>
```

:::tip
Most of the time you won't actually want to manually write all the JSON to add your fonts. Instead you can use the [Create Block Theme](https://wordpress.org/plugins/create-block-theme/) plugin to visually manage your fonts and then output the resulting `theme.json` file directly to your theme.
:::

## Font Library

The font library is part of the Global Styles section inside the site editor of a block theme. It visually allows administrators to manage which fonts are installed on their site.

The font library exposes available font collections in the UI. By default WordPress core includes a collection for Google Fonts. But any developer can add additional font collections in the same way using the `wp_register_font_collection` function.

You can [learn more about registering custom font collections in the core documentation](https://make.wordpress.org/core/2024/03/14/new-feature-font-library/#adding-a-font-collection).

:::caution
On most client builds we don't actually want to rely on administrators adding random custom fonts. Because doing so can have very string negative side effects on both the visual appearance of a site but even more importantly the performance of a site. Therefore the best practice is to already define the correct fonts in the themes `theme.json` file and even disable the font library UI via this filter:

```php
function disable_font_library_ui( $editor_settings ) { 
   	 $editor_settings['fontLibraryEnabled'] = false;
   	 return $editor_settings; 
}

add_filter( 'block_editor_settings_all', 'disable_font_library_ui' );
```

:::
