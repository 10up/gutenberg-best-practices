---
sidebar_label: 10. Block Bindings and Single Templates
sidebar_position: 10
---

# 10. Block Bindings and Single Templates

The Block Bindings API (WordPress 6.5+) lets core blocks read dynamic values from a custom source: post meta, computed data, relationship queries. Instead of building a custom block for every piece of dynamic text, you bind a core Paragraph, Heading, Button, or Image to a data source and let WordPress handle the rendering.

In this lesson you'll register a custom binding source and build the single movie and person templates.

## Learning Outcomes

1. Understand the Block Bindings API: what it does, which blocks support it, and its limitations.
2. Know how to register a custom binding source in PHP with a callback.
3. Know how to register an editor-side preview so bindings show placeholder text while editing.
4. Know the difference between `core/post-meta` (simple fields) and a custom source (computed values).
5. Be able to build single post templates that use bindings for dynamic content.

## Tasks

### 1. Copy files from the answer key

Copy the following from the `fueled-movies` theme:

- `src/BlockBindings.php`
- `assets/js/block-bindings/` (entire directory)
- `patterns/single-movie-trailer.php`
- `templates/single-tenup-movie.html`
- `templates/single-tenup-person.html`

Add the import to `assets/js/block-extensions.js`:

```js
import './block-bindings';
```

Rebuild:

```bash
npm run build
```

### 2. Walk through the PHP binding source

Open `src/BlockBindings.php`. This module follows the same `ModuleInterface` pattern from [Lesson 6](./06-render-filters-and-block-styles.md).

The registration:

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

The callback receives `$source_args` (from the block's `metadata.bindings` attribute) and routes to helper methods:

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
        case 'viewerRatingLabelTextNumberOnly':
            return $this->get_viewer_rating_label( 'number' );
        case 'viewerRatingLabelUrl':
            return $this->get_viewer_rating_label( 'url' );
        default:
            return null;
    }
}
```

#### Example: movieStars

The `movieStars` binding queries Content Connect for related People and returns comma-separated linked names:

```php title="src/BlockBindings.php (movieStars helper)"
private function get_movie_stars() {
    $value   = '';
    $post_id = get_the_ID();

    if ( ! $post_id || ! function_exists( '\TenUp\ContentConnect\Helpers\get_related_ids_by_name' ) ) {
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

    $star_links = array_map( function ( $star ) {
        return sprintf( '<a href="%s">%s</a>', esc_url( get_permalink( $star->ID ) ), esc_html( $star->post_title ) );
    }, $stars_query->posts );

    return implode( ', ', $star_links );
}
```

Use `core/post-meta` for straightforward meta display. Use a custom binding source when you need computed values, relationship queries, formatted output, or fallback logic.

### 3. Walk through the JS editor preview

Block bindings have two halves:

- **PHP source**: returns real values for the frontend
- **JS source**: returns placeholder values for the editor preview

Both share the same source name (`tenup/block-bindings`). WordPress uses the JS source in the editor and the PHP source on the frontend.

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
        if (bindings.url?.args?.key === 'archiveLinkUrl') {
            return { url: '#' };
        }
        // ... more keys
        return {};
    },
    getFieldsList() {
        return [
            { label: 'Archive Link Text', type: 'string', args: { key: 'archiveLinkText' } },
            { label: 'Movie Stars', type: 'string', args: { key: 'movieStars' } },
            // ... more fields
        ];
    },
});
```

`getValues()` provides placeholder text so editors see meaningful content in the canvas. `getFieldsList()` makes bindings discoverable in the editor UI.

TODO_SUGGEST_SCREENSHOT

:::tip
Keep placeholder text realistic so editors understand what will render. "Placeholder Stars" is better than "Loading..." because it communicates the shape of the content.
:::

### Which blocks support bindings?

Currently only **Image**, **Paragraph**, **Heading**, and **Button** support the `metadata.bindings` attribute:

| Block | Bindable properties |
| ----- | ------------------- |
| Paragraph | `content` |
| Heading | `content` |
| Button | `text`, `url` |
| Image | `url`, `alt`, `title` |

### 4. Understand binding markup in templates

In template markup, bindings are added via the `metadata.bindings` attribute on a block.

**`core/post-meta` for simple fields:**

```html
<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"core/post-meta","args":{"key":"tenup_movie_release_year"}}}}} -->
<p></p>
<!-- /wp:paragraph -->
```

**`tenup/block-bindings` for computed values:**

```html
<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tenup/block-bindings","args":{"key":"movieStars"}}}}} -->
<p></p>
<!-- /wp:paragraph -->
```

**Button with both `text` and `url` bound:**

```html
<!-- wp:button {"metadata":{"bindings":{
    "url":{"source":"tenup/block-bindings","args":{"key":"archiveLinkUrl"}},
    "text":{"source":"tenup/block-bindings","args":{"key":"archiveLinkText"}}
}},"className":"is-style-secondary"} -->
<div class="wp-block-button is-style-secondary">
    <a class="wp-block-button__link wp-element-button" href="/movies/">← Back</a>
</div>
<!-- /wp:button -->
```

The inner HTML (`← Back`, the `href`) is the fallback content that gets replaced at render time by the binding source.

### 5. Review the trailer pattern

The trailer pattern (`patterns/single-movie-trailer.php`) demonstrates conditional rendering with PHP logic:

```php title="patterns/single-movie-trailer.php (structure)"
$trailer_id = get_post_meta( get_the_ID(), 'tenup_movie_trailer_id', true );

if ( empty( $trailer_id ) || is_admin() ) :
    // Render placeholder image block
else :
    $url = 'https://www.imdb.com/video/embed/' . $trailer_id . '/';
    // Render iframe in wp:html block
endif;
```

The Avengers movie has no trailer, making it a good test case for the placeholder fallback.

### 6. Tour the single templates

The single templates were copied in step 1. Briefly review their layout structure:

- **Single Movie**: backdrop image, metadata row (release year, MPA rating), two-column layout with poster and trailer, plot/stars sections
- **Single Person**: header with photo and biographical info, filmography section

These templates use simple Paragraphs for metadata right now. In [Lesson 12](./12-custom-blocks.md), you'll revisit them to wrap metadata in `tenup/dl` blocks for semantic HTML. The metadata row uses a basic flex Group without the separator toggle, which comes in [Lesson 11](./11-block-extensions.md). The `tenup/rate-movie` block is added in [Lesson 13](./13-interactivity-api.md).

TODO_SUGGEST_SCREENSHOT

## Null and empty fallback strategy

Bound blocks always render their markup, even when the value is empty. An empty string results in an empty `<p></p>` on the frontend, which may appear as unwanted whitespace next to a label.

The theme uses two fallback strategies:

1. **Empty string for user-facing text**: fields like `movieStars` return `''` when there's no data. The DL blocks added in Lesson 12 will inherit this behavior.
2. **Safe defaults for structural values**: `archiveLinkUrl` falls back to `home_url()` so the link always goes somewhere. `viewerRatingLabelUrl` returns `'#'` as a no-op.

:::caution
Bindings are not conditional: you can't hide a bound block entirely when the value is empty. The block always renders. Plan your fallbacks accordingly.
:::

## Files changed (fueled-movies delta)

| File | Change type | What changes |
| ---- | ----------- | ------------ |
| `src/BlockBindings.php` | **New** | Registers `tenup/block-bindings` source; routes 9 keys to helper methods; Content Connect queries for movieStars and personMovies; date formatting for personBorn/personDied; viewer rating with K notation for counts |
| `assets/js/block-bindings/index.js` | **New** | Client-side `registerBlockBindingsSource()` with `getValues()` placeholders and `getFieldsList()` |
| `assets/js/block-extensions.js` | Modified | Added `import './block-bindings'` |
| `patterns/single-movie-trailer.php` | **New** | Conditional IMDB iframe embed or placeholder image based on `tenup_movie_trailer_id` meta |
| `templates/single-tenup-movie.html` | **New** | Initial version using core/post-meta and tenup/block-bindings throughout |
| `templates/single-tenup-person.html` | **New** | Initial version using core/post-meta and tenup/block-bindings throughout |

## Ship it checkpoint

- Single movie pages show dynamic metadata (release year, MPA rating, plot, stars, viewer rating)
- Single person pages show dynamic metadata (biography, born, birthplace, died, deathplace, movies)
- Editor shows placeholder text for custom bindings
- Trailer embeds from IMDB, with placeholder for movies without trailers
- Back button navigates to the correct archive

TODO_SUGGEST_SCREENSHOT

## Takeaways

- Block bindings let core blocks display dynamic values without custom blocks.
- You need both a PHP source (real values) and a JS source (editor previews).
- Only Image, Paragraph, Heading, and Button support bindings today.
- Use `core/post-meta` for simple meta display. Use a custom source for computed or formatted values.
- Always handle null/empty values: bound blocks always render their markup.
- Bindings are not conditional: you can't hide a block based on whether a value exists.
- The trailer pattern shows how PHP conditional logic in patterns enables dynamic rendering.

## Further reading

- [Block Bindings API](/reference/Patterns/block-bindings-api)
