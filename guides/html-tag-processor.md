# Using the HTML Tag Processor 

## Reference Guide WordPress Documentation:
* [Introducing the HTML API in WordPress 6.2](https://make.wordpress.org/core/2023/03/07/introducing-the-html-api-in-wordpress-6-2/)

### Other Guides on the Topic
* [How to Modify HTML in a PHP WordPress Plugin Using The New Tag Processor API](https://adamadam.blog/2023/02/16/how-to-modify-html-in-a-php-wordpress-plugin-using-the-new-tag-processor-api/)
* [Changing HTML Tag Attributes with the WP HTML Tag Processor](https://wpdevelopment.courses/articles/wp-html-tag-processor/)

## Use Case:
For static blocks we can use the registerBlockExtension to easily add additional classnames. Technically it also works for adding inline styles but we should use that sparingly because it may introduce block validation issues and deprecations.

Another issue is that the block extensions only apply to static blocks. When the rendering happens on the server in PHP it doesn't do anything.

To solve for all these usecases we can use the HTMLTagProcessor and the block render callbacks.

## Code Example:
This example showcases how to use `WP_HTML_Tag_Processor` with new block attributes. This example extends the `core/button` block and adds in fields for `Accessible Text` this new field can then be used within PHP to create a filter with the `WP_HTML_Tag_Processor` to update the value of the rendered block content. In this case add in an `aria-label` with the text provided via the block settings.

```js title="block-filters/button.js"
import { __ } from '@wordpress/i18n';
import { registerBlockExtension } from '@10up/block-components';
import { PanelBody, TextareaControl, RangeControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';

const blockName = 'core/button';

const additionalAttributes = {
	accessibleText: {
		type: 'string',
		default: '',
	}
};

/**
 * BlockEdit
 *
 * a react component that will get mounted in the Editor when the block is
 * selected. It is recommended to use Slots like `BlockControls` or `InspectorControls`
 * in here to put settings into the blocks toolbar or sidebar.
 *
 * @param {object} props block props
 * @returns {HTMLElement}
 */
const BlockEdit = (props) => {
	const {
		attributes: { accessibleText },
		setAttributes,
	} = props;

	return (
		<InspectorControls>
			<PanelBody title={__('Additional Information')}>
				<TextareaControl
					value={accessibleText}
					label={__('Accessible Text')}
					help={__(
						'This replaces what screenreader will read as the link text.',
						'tenup-theme',
					)}
					onChange={(value) => {
						setAttributes({
							accessibleText: value,
						});
					}}
				/>
			</PanelBody>
		</InspectorControls>
	);
};

registerBlockExtension(blockName, {
	extensionName: 'button-updates',
	attributes: additionalAttributes,
	classNameGenerator: () => null,
	inlineStyleGenerator: () => null,
	Edit: BlockEdit,
});
```

```php title="block-overrides/core-button.php"
<?php
/**
 * Core Button Block.
 *
 * @package TenUpTheme
 */

namespace TenUpTheme\BlockOverrides\CoreButton;

/**
 * Default setup routine
 *
 * @return void
 */
function setup(): void {
	add_filter( 'render_block_core/button', __NAMESPACE__ . '\maybe_insert_aria_label', 10, 2 );
}

/**
 * Add `aria-label` attribute to button.
 *
 * @param string $content Block content.
 * @param array  $block   Block data.
 *
 * @return string
 */
function maybe_insert_aria_label( string $content, array $block ) : string {
	$text = $block['attrs']['accessibleText'] ?? false;
	$text = $text ? strval( $text ) : '';
	if ( empty( $text ) ) {
		return $content;
	}

	if ( false !== strpos( $content, 'aria-label' ) ) {
		return $content;
	}

	$button = new \WP_HTML_Tag_Processor( $content );

	// Perform a lookup for the anchor tag 
	$query = array(
		'tag_name' => 'A',
	);

	// No tag is selected until the $xyz->next_tag(); is called
	$button->next_tag( $query );
	$button->set_attribute( 'aria-label', $text );
	$button->set_attribute( 'title', 'I am a title' );

	return $button->get_updated_html();
}

/**
 * Register accessibleText attribute to all blocks
 * Assists with ServerSideRender
 * REST API does data validation against the registered attributes
 * Prevents throwing an error when unknown attributes get passed in
 */
function register_accessibletext_attribute_for_blocks() {
	$registered_blocks = \WP_Block_Type_Registry::get_instance()->get_all_registered();

	foreach ( $registered_blocks as $name => $block ) {
		$block->attributes['accessibleText'] = array( 'type' => 'string' );
	}
}

add_filter( 'wp_loaded', __NAMESPACE__ . '\\register_accessibletext_attribute_for_blocks', 999 );
```

This new methodology can replace the existing `str_replace` methodology where PHP files would handle searching the HTML provided and replacing it via a method like this: `return str_replace( '<a ', '<a aria-label="' . esc_attr( $text ) . '" ', $content );`. Instead the `WP_HTML_Tag_Processor` can be used and the HTML can be modified and returned via a method like this: `return $button->get_updated_html();`

### Another Example:
This example shows how to filter the heading block and insert a class and unique ID on all level 2 headings. In certain situations like this to add a class or set a new attribute requires finding an existing tag first and wrapping that in a conditional.

```bash
use WP_HTML_Tag_Processor;

/**
 * Default setup routine
 *
 * @return void
 */
function setup(): void {
	add_filter( 'render_block_core/heading', __NAMESPACE__ . '\filter_the_markup', 10, 2 );
}

/**
 * Add `id` attribute to h2.
 *
 * @param string $content Block content.
 * @param array  $block   Block data.
 *
 * @return string
 */
function filter_the_markup( string $content, array $block ) : string {
	$block_level = $block['attrs']['level'] ?? false;
	$block_level = $block_level ? intval( $block_level ) : 2;
	// Only target h2 heading level.
	if ( 2 !== $block_level ) {
		return $content;
	}

	// Parse the HTML.
	$attributes = new WP_HTML_Tag_Processor( $content );

	$id = $attributes->get_attribute( 'id' ) ?? false;
	$id = $id ? strval( $id ) : '';
	// Bail early if we already have an `id` attribute.
	if ( ! empty( $id ) ) {
		return $content;
	}

	// Create a unique ID.
	$inner_html = $block['innerHTML'] ?? false;
	$inner_html = $inner_html ? strval( $inner_html ) : '';
	$inner_html = wp_strip_all_tags( $inner_html );
	$id_hash    = md5( $inner_html );

	// Add the attributes to the markup.
	if ( $attributes->next_tag( array( 'class' => 'wp-block-heading' ) ) ) {
		$attributes->set_attribute( 'id', $id_hash );
		$attributes->add_class( 'js-detect-sidebar-heading' );
	}

	return $attributes->get_updated_html();
}
```
