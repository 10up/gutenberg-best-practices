---
sidebar_label: "12. Custom Blocks: Cards, Trailers, Runtime, and Description Lists"
sidebar_position: 12
---

# 12. Custom Blocks: Cards, Trailers, Runtime, and Description Lists

Core blocks cover most layout needs, but some HTML structures and rendering needs have no core equivalent. This lesson builds five custom blocks: the `tenup/card` block that the archive templates from [Lesson 9](./09-archive-templates-and-cards.md) reference, the `tenup/movie-trailer` block that the single movie template from [Lesson 10](./10-block-bindings.md) references, a description list family (`<dl>`, `<dt>`, `<dd>`) for the single templates, and a semantic time block for movie runtime.

## Learning Outcomes

1. Understand a custom block's anatomy: `block.json`, `index.js`, `render.php`, `style.css`.
2. Know how to build parent/child block relationships using `parent` and `allowedBlocks`.
3. Be able to create a dynamic block that renders via PHP.
4. Understand how `usesContext` lets a block read data from the query loop.
5. Know how `get_block_wrapper_attributes()` handles wrapper output.

:::info
To sync your theme with the finished product, run these commands:

```bash
mkdir -p themes/10up-block-theme/blocks
cp -r themes/fueled-movies/blocks/dl themes/10up-block-theme/blocks/dl
cp -r themes/fueled-movies/blocks/dl-item themes/10up-block-theme/blocks/dl-item
cp -r themes/fueled-movies/blocks/dt themes/10up-block-theme/blocks/dt
cp -r themes/fueled-movies/blocks/dd themes/10up-block-theme/blocks/dd
cp -r themes/fueled-movies/blocks/movie-runtime themes/10up-block-theme/blocks/movie-runtime
cp -r themes/fueled-movies/blocks/card themes/10up-block-theme/blocks/card
cp -r themes/fueled-movies/blocks/movie-trailer themes/10up-block-theme/blocks/movie-trailer
cp themes/fueled-movies/src/Blocks.php themes/10up-block-theme/src/Blocks.php
```

The last line picks up the `localize_block_editor_data()` method on `Blocks.php`, which the Movie Trailer block depends on. We'll cover what it does below.

Run `npm run build` when complete.
:::

## Tasks

### 1. Copy blocks from the answer key

Copy the block directories listed above from the `fueled-movies` theme and rebuild.

The theme's `src/Blocks.php` already auto-registers any block with a `block.json` in the `blocks/` directory, so no additional PHP registration is needed.

### 2. Walk through the DL block family

The description list system is a four-block hierarchy for displaying movie and person metadata:

```
tenup/dl              - Parent: the <dl> wrapper
└── tenup/dl-item     - Child: a term+description pair
    ├── tenup/dt      - Leaf: the <dt> term
    └── tenup/dd      - Leaf: the <dd> description (can contain other blocks)
```

#### Enforcing structure with parent and allowedBlocks

The nesting rules are defined in each block's `block.json`:

```json title="blocks/dl-item/block.json (partial)"
{
    "name": "tenup/dl-item",
    "title": "Description List Item",
    "parent": ["tenup/dl"]
}
```

```json title="blocks/dt/block.json (partial)"
{
    "name": "tenup/dt",
    "title": "Description List Term",
    "parent": ["tenup/dl-item"]
}
```

- **`parent`** restricts where a block can be inserted. `tenup/dl-item` can only exist inside `tenup/dl`. `tenup/dt` and `tenup/dd` can only exist inside `tenup/dl-item`.*
- The DL block uses `InnerBlocks` to accept child blocks. The editor automatically filters the inserter to only show allowed children.

_* Alternatively, there is also `ancestor` to be allowed at any level within a blocks nested innerblocks_

![The Description List block used in the inserter](../../static/img/training/editor-description-list-blocks.png)

#### Dynamic rendering with render.php

At 10up we build dynamic blocks: blocks that render on the server via PHP. The `render.php` file is referenced as `render` in `block.json`:

```json title="blocks/dl/block.json (partial)"
{
    "name": "tenup/dl",
    "render": "file:./render.php",
    "editorScript": "file:./index.js",
    "style": "file:./style.css"
}
```

The PHP render template receives three variables:

```php title="blocks/dl/render.php"
<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (inner blocks).
 * @var WP_Block $block      Block instance.
 */

if ( empty( trim( $content ) ) ) {
    return;
}

$block_wrapper_attributes = get_block_wrapper_attributes();
?>

<dl <?php echo $block_wrapper_attributes; ?>>
    <?php echo $content; ?>
</dl>
```

- `$attributes`: the block's saved attributes (from `block.json`)
- `$content`: the rendered HTML of inner blocks (already processed by WordPress)
- `$block`: the full `WP_Block` instance (access context via `$block->context` when `usesContext` is set in `block.json`)

`get_block_wrapper_attributes()` generates the correct wrapper attributes (classes, styles, IDs) based on block supports. Always use this instead of building class names manually.

:::tip
Dynamic blocks avoid deprecation headaches: the markup isn't saved to the database, so you can change it anytime without migration scripts. This is why 10up uses dynamic blocks as the standard.
:::

#### The editor component

The editor side uses `useBlockProps` and `useInnerBlocksProps` from `@wordpress/block-editor`:

```js title="blocks/dl/index.js"
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import { BlockEdit } from './edit';
import metadata from './block.json';

registerBlockType(metadata, {
    edit: BlockEdit,
    save: () => <InnerBlocks.Content />,
});
```

For dynamic blocks, the `save` function returns `<InnerBlocks.Content />` (if the block has inner blocks) or `null` (if it doesn't). The actual frontend markup comes from `render.php`.

#### Auto-registration

You don't need to manually register blocks. `src/Blocks.php` globs `dist/blocks/*/block.json` and calls `register_block_type_from_metadata()` for each:

```php title="src/Blocks.php (simplified)"
public function register_theme_blocks() {
    $block_json_files = glob( TENUP_BLOCK_THEME_BLOCK_DIST_DIR . '*/block.json' );

    foreach ( $block_json_files as $filename ) {
        $block_folder = dirname( $filename );
        register_block_type_from_metadata( $block_folder );
    }
}
```

Drop a folder with a `block.json` into `blocks/` and it's automatically available.

### 3. Walk through the Movie Runtime block

The `tenup/movie-runtime` block demonstrates reading data from the post via block context:

```json title="blocks/movie-runtime/block.json (partial)"
{
    "name": "tenup/movie-runtime",
    "usesContext": ["postId", "postType"],
    "render": "file:./render.php"
}
```

```php title="blocks/movie-runtime/render.php (simplified)"
$post_id = $block->context['postId'] ?? null;
if ( ! $post_id ) {
    return;
}

$runtime = get_post_meta( $post_id, 'tenup_movie_runtime', true );
$hours   = $runtime['hours'] ?? '0';
$minutes = $runtime['minutes'] ?? '0';

if ( '0' === $hours && '0' === $minutes ) {
    return;
}
?>

<time <?php echo get_block_wrapper_attributes( [
    'datetime' => esc_attr( 'PT' . $hours . 'H' . $minutes . 'M' ),
] ); ?>>
    <?php // renders "2h 28m" with ARIA labels ?>
</time>
```

The `usesContext` declaration in `block.json` tells WordPress to pass `postId` and `postType` from the query loop context. This lets the block read meta for whatever post it's rendering inside, without hardcoding a post ID.

:::tip
Inside the editor, `usePostMetaValue` from `@10up/block-components` reads a single meta key against the current post context with one line:

```js
const [runtime] = usePostMetaValue('tenup_movie_runtime');
```

It's a thinner alternative to the `useEntityProp('postType', postType, 'meta', postId)` pattern from [Lesson 8](./08-editor-controls.md) when you only need one key. The `PostMeta` component used in that lesson's sidebar panels is still the right tool there; `usePostMetaValue` shines inside `edit.js` for blocks like Movie Trailer below.
:::

### 4. Walk through the Card block

The Card block is what the archive templates from [Lesson 9](./09-archive-templates-and-cards.md) reference via `<!-- wp:tenup/card {"variant":"..."} /-->`. It demonstrates three patterns worth knowing:

- A single attribute (`variant`) that exposes multiple entries in the inserter via block variations.
- A `parent` constraint that ties the block to a specific context.
- An editor preview composed from a pattern in the registry.

#### Variant attribute and block variations

`block.json` declares one attribute and three variations:

```json title="blocks/card/block.json (partial)"
{
    "name": "tenup/card",
    "title": "Card",
    "attributes": {
        "variant": {
            "type": "string",
            "default": "default"
        }
    },
    "parent": ["core/post-template"],
    "variations": [
        {
            "name": "default",
            "title": "Card",
            "attributes": { "variant": "default" },
            "isActive": ["variant"],
            "isDefault": true,
            "scope": ["inserter"]
        },
        {
            "name": "movie",
            "title": "Movie Card",
            "attributes": { "variant": "movie" },
            "isActive": ["variant"],
            "scope": ["inserter"]
        },
        {
            "name": "person",
            "title": "Person Card",
            "attributes": { "variant": "person" },
            "isActive": ["variant"],
            "scope": ["inserter"]
        }
    ]
}
```

The `isActive: ['variant']` array is the important bit. It tells the editor to identify the active variation by comparing the block instance's `variant` attribute against each variation's attribute value. That's what lights up "Movie Card" or "Person Card" in the block toolbar, breadcrumb, and List View when an editor selects a card. Without `isActive`, all three variations would render as the generic "Card" title at runtime and an editor would have no quick way to tell them apart.

`parent: ["core/post-template"]` ensures the block can only be inserted inside a Query Loop's Post Template. The variant-driven bindings inside the inner patterns only resolve against a post context, so the constraint surfaces the rule to editors before they're confused by it.

:::tip
[`ancestor`](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#ancestor) is also a suitable alternative when the block just needs to exist somewhere within a parent and could be safely nested in Groups or the like.
:::

#### Editor preview from the inner patterns

The block's `edit.js` looks up the matching `card-inner-{variant}` pattern by slug from WordPress's block pattern registry, parses it, and feeds the parsed blocks into `useInnerBlocksProps` as a template:

```js title="blocks/card/edit.js (simplified)"
const patternContent = useSelect(
    (select) =>
        select('core').getBlockPatterns?.()
            ?.find((pattern) => pattern.name === `tenup-theme/card-inner-${variant}`)
            ?.content ?? '',
    [variant],
);

const template = useMemo(() => blocksToTemplate(parse(patternContent)), [patternContent]);

const blockProps = useBlockProps({ className: 'is-clickable-card' });
const innerBlocksProps = useInnerBlocksProps(blockProps, {
    template,
    templateLock: 'all',
    renderAppender: false,
});
```

`save: () => null` keeps the persisted markup small. The only thing that round-trips through the editor is `<!-- wp:tenup/card {"variant":"movie"} /-->`. Both the editor preview and the frontend re-derive the visual from the inner pattern, which keeps the storage tiny and the rendering safe across editor exports (the paste-safety argument from [Lesson 9](./09-archive-templates-and-cards.md)).

:::note
Why not just `[['core/pattern', { slug }]]` as the template? `core/pattern` expands itself by dispatching `replaceBlocks` on mount, and a `templateLock: 'all'` parent blocks that dispatch. The expanded preview never appears; the placeholder text stays in view. Parsing the pattern ahead of time and feeding the resulting blocks into the template sidesteps the conflict. Worth knowing if you hit "Pattern Placeholder" stuck in a locked block.
:::

The `is-clickable-card` class on the block wrapper hooks into the JS utility from [Lesson 5](./05-styles.md#clickable-cards), and the [Lesson 6](./06-render-filters-and-block-styles.md#3-replace-href-less-button-anchors-with-spans) button filter keeps the decorative Trailer / View More buttons from intercepting card-level clicks.

### 5. Walk through the Movie Trailer block

`blocks/movie-trailer/` is the block referenced from the single movie template you copied in [Lesson 10](./10-block-bindings.md). It reads a movie's IMDB trailer ID from post meta and renders either an iframe embed of the trailer or a placeholder image when no trailer is set. The same paste-safety argument from [Lesson 9](./09-archive-templates-and-cards.md) applies here: storing meta-driven rendering inside a block keeps it working across editor round-trips.

The frontend reads `tenup_movie_trailer_id` from the current post and renders either an IMDB iframe embed or a placeholder image:

```php title="blocks/movie-trailer/render.php (simplified)"
$post_id = $block->context['postId'] ?? null;
if ( ! $post_id ) {
    return;
}

$trailer_id      = get_post_meta( $post_id, 'tenup_movie_trailer_id', true );
$placeholder_url = get_theme_file_uri( 'blocks/movie-trailer/placeholder.png' );

if ( empty( $trailer_id ) ) : ?>
    <figure <?php echo get_block_wrapper_attributes(); ?>>
        <img src="<?php echo esc_url( $placeholder_url ); ?>" alt="<?php esc_attr_e( 'Trailer not available', 'tenup-block-theme' ); ?>" />
    </figure>
<?php else :
    $embed_url = 'https://www.imdb.com/video/embed/' . $trailer_id . '/'; ?>
    <div <?php echo get_block_wrapper_attributes(); ?>>
        <iframe src="<?php echo esc_url( $embed_url ); ?>" allowfullscreen loading="lazy"></iframe>
    </div>
<?php endif;
```

#### `usePostMetaValue` in the editor

The editor preview mirrors the frontend with much less ceremony:

```js title="blocks/movie-trailer/edit.js"
import { useBlockProps } from '@wordpress/block-editor';
import { usePostMetaValue } from '@10up/block-components';

export const BlockEdit = () => {
    const [trailerId] = usePostMetaValue('tenup_movie_trailer_id');
    const blockProps = useBlockProps();

    if (!trailerId) {
        const placeholderUrl = window.tenupMovieTrailer?.placeholderUrl ?? '';
        return (
            <figure {...blockProps}>
                <img src={placeholderUrl} alt="" />
            </figure>
        );
    }

    return (
        <div {...blockProps}>
            <iframe
                src={`https://www.imdb.com/video/embed/${trailerId}/`}
                allowFullScreen
                loading="lazy"
                title="Movie trailer"
            />
        </div>
    );
};
```

`usePostMetaValue` resolves the current post via `usePost()` internally, so the edit component never has to destructure `props.context` or pass `postType`/`postId` explicitly.

#### Placeholder URL via inline script

Notice `window.tenupMovieTrailer?.placeholderUrl` in the editor code. That global is populated by an inline script in `src/Blocks.php`:

```php title="src/Blocks.php (existing method)"
public function localize_block_editor_data() {
    wp_add_inline_script(
        'tenup-movie-trailer-editor-script',
        sprintf(
            'window.tenupMovieTrailer = %s;',
            wp_json_encode( [
                'placeholderUrl' => get_theme_file_uri( 'blocks/movie-trailer/placeholder.png' ),
            ] )
        ),
        'before'
    );
}
```

Why an inline script at all? The intuitive solution would be `import placeholderUrl from './placeholder.png'` in `edit.js`. 10up-toolkit's default webpack configuration does not register an asset-module rule for binary imports, so PNG imports fall through and the build fails with "Unexpected character". You can extend the toolkit's webpack config to add the rule, or move the image to `assets/images/` where the toolkit's `CopyPlugin` copies it into `dist/images/`. Until you do, an inline script that surfaces a server-derived URL through `window.tenupMovieTrailer` is the path of least resistance.  This example is worth keeping in your back pocket whenever editor JS needs a value that only PHP can compute.

### 6. Revisit single templates

Update both single templates in the Site Editor to use the new blocks:

**Single Movie** (`templates/single-tenup-movie.html`):
- Wrap plot, stars, and genre in `tenup/dl` blocks
- Add `tenup/movie-runtime` to the metadata row

Notice how the `tenup/dd` blocks contain bound Paragraphs from [Lesson 10](./10-block-bindings.md). The Plot field uses `core/post-meta` (reading directly from meta), while the Stars field uses our custom `tenup/block-bindings` source (querying Content Connect relationships and returning linked names). The DL blocks provide the semantic HTML structure; the bindings provide the dynamic data.

:::warning
Is it worth mentioning once more here that our bindings will still return an empty paragraph tag if they are not set _(i.e. - no Plot meta or Stars relationship)_.

For our custom binding, we can return the fallback in our php callback if we wish, but our for our `core/post-meta` binding we would add our fallback here in the template.
:::

```html title="DL usage example in single-tenup-movie.html"
<!-- wp:tenup/dl {"style":{"layout":{"selfStretch":"fill"}},"layout":{"type":"default"}} -->
    <!-- wp:tenup/dl-item {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
        <!-- wp:tenup/dt {"content":"Genre","style":{"layout":{"selfStretch":"fixed","flexSize":"5.5rem"}},"textColor":"text-secondary"} /-->
        <!-- wp:tenup/dd {"style":{"layout":{"selfStretch":"fill"}}} -->
            <!-- wp:post-terms {"term":"tenup-genre"} /-->
        <!-- /wp:tenup/dd -->
    <!-- /wp:tenup/dl-item -->

    <!-- wp:tenup/dl-item {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
        <!-- wp:tenup/dt {"content":"Plot","textColor":"text-secondary"} /-->
        <!-- wp:tenup/dd -->
            <!-- wp:paragraph {
                "metadata": {
                    "bindings": {
                        "content": {
                            "source": "core/post-meta",
                            "args": { "key": "tenup_movie_plot" }
                        }
                    }
                }
            } -->
            <p></p>
            <!-- /wp:paragraph -->
        <!-- /wp:tenup/dd -->
    <!-- /wp:tenup/dl-item -->

    <!-- wp:tenup/dl-item {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
        <!-- wp:tenup/dt {"content":"Stars","textColor":"text-secondary"} /-->
        <!-- wp:tenup/dd -->
            <!-- wp:paragraph {
                "metadata": {
                    "bindings": {
                        "content": {
                            "source": "tenup/block-bindings",
                            "args": { "key": "movieStars" }
                        }
                    }
                }
            } -->
            <p></p>
            <!-- /wp:paragraph -->
        <!-- /wp:tenup/dd -->
    <!-- /wp:tenup/dl-item -->
<!-- /wp:tenup/dl -->
```

**Single Person** (`templates/single-tenup-person.html`):
- Wrap biography, born, birthplace, died, deathplace, and movies in `tenup/dl` blocks

Export the updated markup back to the theme files.

![The Description List block output on the frontend](../../static/img/training/frontend-dl-block-bindings.png)
*Our Description List blocks on the frontend with bound innerblock content*

## Files changed in this lesson

| File | Change type | What changes |
| ---- | ----------- | ------------ |
| `blocks/dl/` | **New** | Block metadata, edit component, render.php, styles |
| `blocks/dl-item/` | **New** | `parent: ["tenup/dl"]`, render.php |
| `blocks/dt/` | **New** | `parent: ["tenup/dl-item"]`, inline editable term |
| `blocks/dd/` | **New** | `parent: ["tenup/dl-item"]`, inner blocks container |
| `blocks/movie-runtime/` | **New** | `usesContext: ["postId", "postType"]`, semantic `<time>` output |
| `blocks/card/` | **New** | `variant` attribute with three `isActive` variations; `parent: ["core/post-template"]`; editor preview composed from `card-inner-{variant}` patterns; `save: () => null` |
| `blocks/movie-trailer/` | **New** | IMDB iframe or placeholder image based on `tenup_movie_trailer_id`; editor uses `usePostMetaValue` |
| `src/Blocks.php` | **Revisited** | `localize_block_editor_data()` exposes the trailer placeholder URL to editor JS via `window.tenupMovieTrailer` |
| `templates/single-tenup-movie.html` | **Revisited** | Plot/Stars/Genre wrapped in `tenup/dl` blocks; `tenup/movie-runtime` added to metadata row |
| `templates/single-tenup-person.html` | **Revisited** | All metadata paragraphs wrapped in `tenup/dl` blocks |

## Ship it checkpoint

- DL blocks enforce nesting: only dl-item inside dl, only dt/dd inside dl-item
- Movie runtime displays as "2h 28m" with semantic `<time>` element
- Single movie template has DL with Genre, Plot, Stars
- Single person template has DL with Biography, Born, Birthplace, Died, Deathplace, Movies
- Archive pages from [Lesson 9](./09-archive-templates-and-cards.md) now render movie, person, and default cards with no missing-block placeholders
- Single movie pages render the IMDB trailer (or its placeholder fallback) via `tenup/movie-trailer`

## Takeaways

- Custom blocks: `block.json` for metadata, `index.js` for the editor, `render.php` for the frontend.
- Dynamic blocks (PHP-rendered) avoid deprecation problems: the 10up standard.
- Use `parent` and `allowedBlocks` to enforce nesting rules in parent/child block systems.
- `get_block_wrapper_attributes()` handles wrapper classes, styles, and IDs. Always use it.
- `usesContext` in `block.json` lets blocks read data from query loop context.
- A `variant`-style attribute combined with `isActive: ['variant']` lets one block expose multiple titled entries in the inserter and the block toolbar.
- `usePostMetaValue` from `@10up/block-components` reads a single meta key inside `edit.js` with no boilerplate. Reach for it when you'd otherwise reach for `useEntityProp`.
- An inline script via `wp_add_inline_script` is a reasonable bridge whenever editor JS needs a value that only PHP can compute.
- Drop a folder with `block.json` into `blocks/` and auto-registration handles the rest.

## Further reading

- [Custom Blocks](/reference/Blocks/custom-blocks)
- [Inner Blocks](/reference/Blocks/inner-blocks)
- [Building Blocks training](../Blocks/01-overview.md)
