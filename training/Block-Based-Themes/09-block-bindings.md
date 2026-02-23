---
sidebar_label: 9. Block Bindings API
sidebar_position: 9
---

# 9. Block Bindings API

The Block Bindings API (WordPress 6.5+) lets core blocks read dynamic values from a custom source — post meta, computed data, relationship queries. Instead of building a custom block for every piece of dynamic text, you bind a core Paragraph, Heading, Button, or Image to a data source and let WordPress handle the rendering.

## Learning Outcomes

1. Understand the Block Bindings API: what it does, which blocks support it, and its limitations.
2. Know how to register a custom binding source in PHP with a callback.
3. Know how to register an editor-side preview so bindings show placeholder text while editing.
4. Understand null/empty fallback strategy.

## How it works

Block bindings have two halves:

- **PHP source** — returns real values for the frontend. Registered with `register_block_bindings_source()`.
- **JS source** — returns placeholder values for the editor preview. Registered with `registerBlockBindingsSource()`.

Both share the same source name (`tenup/block-bindings`). WordPress uses the JS source in the editor and the PHP source on the frontend.

### Which blocks support bindings?

Currently only **Image**, **Paragraph**, **Heading**, and **Button** support the `metadata.bindings` attribute. Each block exposes specific bindable properties:

| Block | Bindable properties |
|-------|-------------------|
| Paragraph | `content` |
| Heading | `content` |
| Button | `text`, `url` |
| Image | `url`, `alt`, `title` |

## The PHP source

The `fueled-movies` theme registers a binding source that routes 8 keys to helper methods:

```php title="src/BlockBindings.php (registration)"
public function register_block_bindings() {
    register_block_bindings_source(
        'tenup/block-bindings',
        array(
            'label'              => __( 'Fueled Movies Theme', 'tenup' ),
            'get_value_callback' => [ $this, 'block_bindings_callback' ],
        )
    );
}
```

The callback receives `$source_args` (from the block's `metadata.bindings` attribute) and returns a string value:

```php title="src/BlockBindings.php (callback routing)"
public function block_bindings_callback( $source_args ) {
    if ( ! isset( $source_args['key'] ) ) {
        return null;
    }

    switch ( $source_args['key'] ) {
        case 'archiveLinkText':
            return $this->get_archive_link( 'text' );
        case 'archiveLinkUrl':
            return $this->get_archive_link( 'url' );
        case 'movieStars':
            return $this->get_movie_stars();
        case 'personBorn':
            return $this->get_person_born();
        case 'personDied':
            return $this->get_person_died();
        case 'personMovies':
            return $this->get_person_movies();
        case 'viewerRatingLabelText':
            return $this->get_viewer_rating_label( 'text' );
        case 'viewerRatingLabelUrl':
            return $this->get_viewer_rating_label( 'url' );
        default:
            return null;
    }
}
```

### Example: movieStars

The `movieStars` binding queries Content Connect for related People and returns comma-separated linked names:

```php title="src/BlockBindings.php (movieStars helper)"
private function get_movie_stars() {
    $value   = __( 'n/a', 'tenup' );
    $post_id = get_the_ID();

    if ( ! $post_id ) {
        return $value;
    }

    $star_ids = \TenUp\ContentConnect\Helpers\get_related_ids_by_name( $post_id, 'movie_person' );

    if ( empty( $star_ids ) ) {
        return $value;
    }

    $stars_query = new \WP_Query( [
        'post_type'      => Person::POST_TYPE,
        'post__in'       => $star_ids,
        'orderby'        => 'post__in',
        'posts_per_page' => 99,
    ] );

    if ( ! $stars_query->have_posts() ) {
        return $value;
    }

    $star_links = array_map(
        function ( $star ) {
            return sprintf(
                '<a href="%s">%s</a>',
                esc_url( get_permalink( $star->ID ) ),
                esc_html( $star->post_title )
            );
        },
        $stars_query->posts
    );

    return implode( ', ', $star_links );
}
```

Notice the fallback strategy: `$value` starts as `'n/a'` and every early return preserves that fallback. This ensures bound blocks never render an empty `<p></p>` next to a label like **Stars:**.

## The JS source (editor preview)

The editor-side source provides placeholder values so editors see meaningful content in the canvas:

```js title="assets/js/block-bindings/index.js"
import { registerBlockBindingsSource } from '@wordpress/blocks';

registerBlockBindingsSource({
    name: 'tenup/block-bindings',
    label: 'Fueled Movies Theme',
    usesContext: ['postId', 'postType'],
    getValues({ bindings }) {
        if (bindings.content?.args?.key === 'movieStars') {
            return { content: 'Placeholder Stars' };
        }

        if (bindings.content?.args?.key === 'personBorn') {
            return { content: 'January 1, 1970' };
        }

        if (bindings.text?.args?.key === 'archiveLinkText') {
            return { text: '← Back' };
        }

        // ... more keys

        return {};
    },
});
```

The `getValues` function checks which binding property and key are being requested and returns appropriate placeholder text. This is what editors see in the Site Editor when working with bound blocks.

> 📷 **Screenshot suggestion**: Side by side — the Site Editor showing placeholder text in bound Paragraph blocks, and the frontend showing real data. This makes the two-source concept click.

:::tip
Keep placeholder text realistic so editors understand what will render. "Placeholder Stars" is better than "Loading..." because it communicates the shape of the content.
:::

## Using bindings in templates

In template markup, bindings are added via the `metadata.bindings` attribute on a block:

```html title="templates/single-tenup-movie.html (binding example)"
<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tenup/block-bindings","args":{"key":"movieStars"}}}}} -->
<p></p>
<!-- /wp:paragraph -->
```

For Button blocks, you can bind both `text` and `url`:

```html title="templates/single-tenup-movie.html (button binding)"
<!-- wp:button {"metadata":{"bindings":{
    "url":{"source":"tenup/block-bindings","args":{"key":"archiveLinkUrl"}},
    "text":{"source":"tenup/block-bindings","args":{"key":"archiveLinkText"}}
}}} -->
<div class="wp-block-button">
    <a class="wp-block-button__link wp-element-button" href="/movies/">← Back</a>
</div>
<!-- /wp:button -->
```

The inner HTML (`← Back`, the `href`) is the fallback content that gets replaced at render time by the binding source.

### core/post-meta bindings

WordPress also ships a built-in binding source for post meta: `core/post-meta`. Simple fields that just need to display a meta value can use this without any custom PHP:

```html
<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"core/post-meta","args":{"key":"tenup_movie_release_year"}}}}} -->
<p></p>
<!-- /wp:paragraph -->
```

Use `core/post-meta` for straightforward meta display. Use a custom binding source when you need computed values, relationship queries, formatted output, or fallback logic.

## Null and empty fallback strategy

Bound blocks always render their markup, even when the value is empty. An empty string results in an empty `<p></p>` on the frontend — which may appear as unwanted whitespace next to a label.

The `fueled-movies` theme uses two fallback strategies:

1. **`'n/a'` for user-facing text** — Fields like `movieStars`, `personBorn`, and `personDied` return `__( 'n/a', 'tenup' )` when there's no data. This is translatable and communicates "no data available" to the user.

2. **Safe defaults for structural values** — `archiveLinkUrl` falls back to `home_url()` so the link always goes somewhere. `viewerRatingLabelUrl` returns `'#'` as a no-op.

:::caution
Bindings are not conditional — you can't hide a bound block entirely when the value is empty. The block always renders. Plan your fallbacks accordingly.
:::

## Tasks

1. **Read the PHP source.** Open `BlockBindings.php`. Find `register_block_bindings_source()`. Trace one key (e.g. `movieStars`) through the callback to the Content Connect query.

2. **Read the editor preview.** Open `block-bindings/index.js`. See how it returns placeholder strings for the same keys.

3. **Add a new binding key.** If you added `MovieTagline` in previous lessons, add a `movieTagline` key:
   - PHP: add a case to `block_bindings_callback()` and a helper method
   - JS: add a placeholder value in `getValues()`

4. **Use it in a template.** Add a Paragraph block with binding attributes in the single movie template's Code Editor view:

```html
<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tenup/block-bindings","args":{"key":"movieTagline"}}}}} -->
<p></p>
<!-- /wp:paragraph -->
```

5. **Test both scopes.** Editor shows placeholder text. Frontend shows real data (or `'n/a'` if empty).

## Takeaways

- Block bindings let core blocks display dynamic values without custom blocks.
- You need both a PHP source (real values) and a JS source (editor previews).
- Only Image, Paragraph, Heading, and Button support bindings today.
- Use `core/post-meta` for simple meta display. Use a custom source for computed or formatted values.
- Always handle null/empty values — bound blocks always render their markup.
- Bindings are not conditional — you can't hide a block based on whether a value exists.

## Ship it checkpoint

- A new binding key exists in both PHP and JS
- The binding works: editor shows placeholder, frontend shows real value
- Empty inputs return a safe fallback (not an empty string)

## Further reading

- [Block Bindings API](/reference/Patterns/block-bindings-api)
