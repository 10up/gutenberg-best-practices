# Block Patterns

Block Patterns are a great way to get up and running quickly when editing a page in WordPress. They allow you to insert entire predefined templates so that you don't have to start from scratch. As an editor you get a really nice visual preview of what the pattern looks like. 

![](/pattern-modal.png)

## How to create block Patterns:

Adding patterns also is very easy from a development perspective. The [`register_block_pattern`](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/#register_block_pattern) API allows you to easily register your own patterns that will get shown in the Pattern Picker.

```php
register_block_pattern(
    'my-plugin/my-awesome-pattern',
    array(
        'title'       => __( 'Two buttons', 'my-plugin' ),
        'description' => _x( 'Two horizontal buttons, the left button is filled in, and the right button is outlined.', 'Block pattern description', 'my-plugin' ),
        'content'     => "<!-- wp:buttons {\"align\":\"center\"} -->\n<div class=\"wp-block-buttons aligncenter\"><!-- wp:button {\"backgroundColor\":\"very-dark-gray\",\"borderRadius\":0} -->\n<div class=\"wp-block-button\"><a class=\"wp-block-button__link has-background has-very-dark-gray-background-color no-border-radius\">" . esc_html__( 'Button One', 'my-plugin' ) . "</a></div>\n<!-- /wp:button -->\n\n<!-- wp:button {\"textColor\":\"very-dark-gray\",\"borderRadius\":0,\"className\":\"is-style-outline\"} -->\n<div class=\"wp-block-button is-style-outline\"><a class=\"wp-block-button__link has-text-color has-very-dark-gray-color no-border-radius\">" . esc_html__( 'Button Two', 'my-plugin' ) . "</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->",
    )
); 
```

To improve the developer experience it makes sense to move the actual `content` out into a separate php file that we include here. This makes it much more maintainable.

`block-patterns/buttons.php`:
```php
<!-- wp:buttons { "align": "center" } -->
<div class="wp-block-buttons aligncenter">
	<!-- wp:button { "backgroundColor": "very-dark-gray", "borderRadius": 0 } -->
	<div class="wp-block-button">
		<a class="wp-block-button__link has-background has-very-dark-gray-background-color no-border-radius">
			<?php echo esc_html__( 'Button One', 'my-plugin' ); ?>
		</a>
	</div>
	<!-- /wp:button -->
	<!-- wp:button { "textColor": "very-dark-gray", "borderRadius": 0, "className": "is-style-outline" } -->
	<div class="wp-block-button is-style-outline">
		<a class="wp-block-button__link has-text-color has-very-dark-gray-color no-border-radius">
			<?php echo esc_html__( 'Button Two', 'my-plugin' ); ?>
		</a>
	</div>
	<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

`blocks/register-paterns.php`:
```php

/**
 * Get Pattern Content.
 *
 * @param string $name Pattern name.
 * @return string
 */
function get_pattern_content( $name ) {
     $path    = "block-patterns/{$name}.php";
     if ( file_exists( $path ) ) {
         ob_start();
         require $path;
         return ob_get_clean();
     }
}

register_block_pattern(
    'my-plugin/my-awesome-pattern',
    array(
        'title'       => __( 'Two buttons', 'my-plugin' ),
        'description' => _x( 'Two horizontal buttons, the left button is filled in, and the right button is outlined.', 'Block pattern description', 'my-plugin' ),
        'content'     => get_pattern_content( 'buttons' );
    )
); 
```