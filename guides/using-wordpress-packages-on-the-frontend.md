---
sidebar_label: Using WordPress packages on the frontend
---
# Using `@wordpress` packages on the frontend

As part of the gutenberg project WordPress has gained much more than just the editor itself. The gutenberg repository currently houses more than 80 individual packages. These packages span everything from the actual react components, utilities to calculate word count, end-to-end test utilities and much more. Naturally there is the desire to also use some of these packages in the frontend code we are shipping. However, because there are many caveats when trying to use them on the frontend which is why it is generally **not recommended** to do so.

You can find a list of `@wordpress/` packages that are the exception to this rule and that can be used in the [Useful packages outside of the editor](#useful-packages-outside-of-the-editor) section.

:::warning
The `@wordpress/` dependencies are first and foremost designed to be used within the editor. Therefore they are not super optimized for frontend performance and size. Many of the packages rely on [`lodash`](https://lodash.com) or [`moment`](https://momentjs.com) and therefore come with a **lot** of code.
:::warning

## Bundle size

One of the pitfalls of using the [Dependency Extraction Webpack Plugin](https://www.npmjs.com/package/@wordpress/dependency-extraction-webpack-plugin) is that you don't see the size of the externalized WordPress packages. They are not a part of your bundle but instead get added as an additional script that gets loaded before yours. And these WordPress bundled scripts don't allow you to do any sort of tree shaking.

This is especially problematic because they often rely on individual functions from [`lodash`](https://lodash.com) but therefore load all of lodash as a result. Which is a heavy import.

Speaking of [`lodash`](https://lodash.com) one pitfall is, that the [Dependency Extraction Webpack Plugin](https://www.npmjs.com/package/@wordpress/dependency-extraction-webpack-plugin) externalizes more than just the `@wordpress/*` dependencies. It externalizes all these imports:

- [`moment`](https://momentjs.com)
- `@babel/runtime/regenerator`
- [`lodash`](https://lodash.com) / [`lodash-es`](https://www.npmjs.com/package/lodash-es)
- [`jquery`](https://jquery.com)
- [`react`](https://reactjs.org)
- [`react-dom`](https://reactjs.org/docs/react-dom.html)
- [`react-refresh/runtime`](https://www.npmjs.com/package/react-refresh)
- `@wordpress/*`

:::info
There are some `@wordpress/` packages, like the [`@wordpress/icons`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-icons/) package, that are not bundled in WordPress and therefore don't get externalized. You can view the [excluded list in the GitHub repo](https://github.com/WordPress/gutenberg/blob/b1f2064d64df4db70a379c690ee1e28ebef8b86d/packages/dependency-extraction-webpack-plugin/lib/util.js#L2-L6).
:::info

This means that even if any of your other frontend dependencies tries to load something from lodash the [Dependency Extraction Webpack Plugin](https://www.npmjs.com/package/@wordpress/dependency-extraction-webpack-plugin) will pick that up and add [`lodash`](https://lodash.com) to your dependency array.

## Editor dependant packages

The [`@wordpress/packages`](https://developer.wordpress.org/block-editor/reference-guides/packages/) can also be divided into different groups. There are some that are dependant on being used in the editor. The entire [`@wordpress/block-editor`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/) package for example should not be used outside of the editor because it depends on the surrounding architecture like the data api being setup correctly etc.

:::caution
As a rule of thumb any package that includes _editor_ in it's name should **not** be used outside of the editor.
:::caution

## Useful packages outside of the editor

There are some packages that suit themselves very well for being used outside of the editor. This list is not comprehensive and if something is not listed here it doesn't mean that it cannot be used on the frontend. These are just some good examples of packages that showed they work well on the frontend.

### [`@wordpress/dom-ready`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dom-ready/)

The [`@wordpress/dom-ready`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dom-ready/) package is a simple utility function that makes it super simple to only invoke a callback once the dom is loaded.

```js
import domReady from '@wordpress/dom-ready';

domReady( function () {
    //do something after DOM loads.
} );
```

If you look at the [source code for the package](https://github.com/WordPress/gutenberg/blob/71a63fd636b871b73e475821f94fa634e7550b92/packages/dom-ready/src/index.js#L31-L45) it really is nothing more than an event listener for the `DOMContentLoaded` event with additional checks for the `document.readyState` `complete` or `interactive`.

### [`@wordpress/i18n`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/)

Localizing strings within frontend js code always is a bit of a pain. Usually you would use [`wp_localize_script`](https://developer.wordpress.org/reference/functions/wp_localize_script/) in order to provide the localized strings as a variable. This gets rather difficult to manage though with plurals etc. Using the [`@wordpress/i18n`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/) package to manage frontend translations can solve this by providing the developers with the same `__`, `_n`, `_x`, etc. functions that they are used to from php.

Since we are not using the WordPress bundled version of the `i18n` package we will manually need to load our script translations though like so:

```php title="core.php"
/**
 * Get the Translation strings used on Frontend JSs
 * the load_script_textdomain function handles loading the correct json file for the the current locale
 *
 * Because we are bundling the i18n package in our theme we need to manually call `setLocaleData` on the frontend.
 * `wp_set_script_translations` calls `wp.i18n.setLocaleData` which is not the same instance of `i18n` as the one we
 * bundle in the theme.
 *
 * @see https://core.trac.wordpress.org/browser/tags/5.8/src/wp-includes/class.wp-scripts.php#L591
 */
$json_translations = load_script_textdomain( 'frontend', 'tenup-theme', TENUP_THEME_PATH . 'languages' );
if ( ! $json_translations ) {
	// Register empty locale data object to ensure the domain still exists.
	$json_translations = '{ "locale_data": { "messages": { "": {} } } }';
}
// Localize JS translations
wp_localize_script(
	'frontend',
	'tenupThemeFrontendTranslations',
	json_decode( $json_translations, true )
);
```

```js title="frontend.js"
import { setLocaleData } from '@wordpress/i18n';

/**
 * setTranslationData
 *
 * use the data supplied via `wp_localize_script` to manually set the locale data for the `i18n` package
 * This would normally happen automatically by using the `wp_set_script_translations` function in php but because
 * we are no longer using the `i18n` package bundled in WordPress core we need to manually replicate this behavior.
 *
 * @see https://core.trac.wordpress.org/browser/tags/5.8/src/wp-includes/class.wp-scripts.php#L591
 *
 * @return {void}
 */
export function setTranslationData() {
	if (!window.tenupThemeFrontendTranslations) {
		return;
	}

	const domain = 'tenup-theme';
	const translations = window.tenupThemeFrontendTranslations;
	const localeData = translations.locale_data[domain] || translations.locale_data.messages;
	localeData[''].domain = domain;
	setLocaleData(localeData, domain);
}

```

### [`@wordpress/html-entities`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-html-entities/)

The [`@wordpress/html-entities`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-html-entities/) package is super useful when working with data from the WordPress REST API when you manually need to decode html entities because you may not want to use the `rendered` value due to having to use `innerHTML` or  `dangerouslySetInnerHTML` if you are using react.

```js
import { decodeEntities } from '@wordpress/html-entities';

const result = decodeEntities( '&aacute;' );
console.log( result ); // result will be "á"
```
