---
sidebar_position: 1
---

# Block Patterns

Block Patterns are a great way to get up and running quickly when editing a page in WordPress. They allow you to insert entire predefined templates so that you don't have to start from scratch. As an editor you get a really nice visual preview of what the pattern looks like.

![Pattern Explorer Modal](/img/pattern-modal.jpg)

## What should patterns be used for?

Patterns are best suited for commonly used sections within a design system. If you for example have a Pricing table that should normally be used with a heading above and a full width colored background that would make a perfect pattern.

You can also put entire Page layouts into block patterns to really get someone up and running quickly which might be useful for projects where the editors commonly need to create similar types of landing pages for example.

In general they are best suited for predefined sections in a page.

## How to create block Patterns

Adding patterns also is very easy from a development perspective. The [`register_block_pattern`](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/#register_block_pattern) API allows you to easily register your own patterns that will get shown in the Pattern Picker.

```php title="includes/blocks.php"
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

```php title="block-patterns/buttons.php"
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

```php title="blocks/register-patterns.php"

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

## Locking Patterns

You can also use patterns to lock down some aspects of the editorial experience. When creating a pattern you can restrict the ability for a user to move and or remove certain blocks. Additionally you can also restrict what types of blocks are allowed to be used within a columns or group block.

With these controls it becomes much easier to create a refined controlled editorial experience.

### Locking the ability to remove / move a block

Individual blocks can lock down their ability to be moved and or removed. This is done via an attribute that is added by WordPress to every single block called `lock`. The `lock` attribute is an object that accepts two properties: `move` and `remove`. Both of them are `Boolean` values. There is no UI to control the lock state of a block. It can only be controlled via code.

In a pattern you can set these attributes via the html comment of the block where you can set its attributes.

```php
<!-- wp:columns -->
<div class="wp-block-columns">
    // highlight-start
    <!-- wp:column { "lock": { "move": false, "remove": false } } -->
    // highlight-end
    <div class="wp-block-column">
        ...
    </div>
    <!-- /wp:column -->

    // highlight-start
    <!-- wp:column { "lock": { "move": false, "remove": false } } -->
    // highlight-end
    <div class="wp-block-column">
        ...
    </div>
    <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

### Restricting which inner blocks can be used

The core column, group, and cover block support the ability to restrict which blocks are allowed within the inner blocks area. This is being done via two attributes that exist on the se blocks. The `allowedBlocks` and `templateLock` attributes can be set via the html comment in patterns to restrict which blocks can be inserted within a specific pattern. And with the ability to also define a `templateLock` you can even make it so that editors cannot move or remove any of the children within a column for example.

```php
<!-- wp:columns -->
<div class="wp-block-columns">
    // highlight-start
    <!-- wp:column { "allowedBlocks": [ "core/image" ], "templateLock": "all" } } -->
    // highlight-end
    <div class="wp-block-column">
        ...
    </div>
    <!-- /wp:column -->

    // highlight-start
    <!-- wp:column { "allowedBlocks": [ "core/heading", "core/paragraph" ], "templateLock": "all" } } -->
    // highlight-end
    <div class="wp-block-column">
        ...
    </div>
    <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

:::tip
Since these patterns are php files you can make the `allowedBlocks` list filterable via an `apply_filters` hook.
:::tip

## Caveats with using Block Patterns

:::caution
There is one item that you need to be aware about in regards to Block Patterns. Once they are inserted they have no link to the original block pattern that they were created by. On insertion they become regular blocks. Therefore it is not possible to adjust all occurrences of a block pattern after it has been used.
:::caution

If you find an issue with the markup of a pattern that you want to fix it is only going to impact new instances of the pattern that are created after you updated it. And you will have to manually go into every instance that was created using the pattern and make the update manually, or create an update script to update it in the database directly.

If you want to get around this limitation you can of course also build block patterns made up of [custom-blocks](./custom-blocks) that don't actually store their markup in the database. That way you can get the benefits of both worlds.
