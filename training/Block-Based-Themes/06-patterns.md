---
sidebar_label: 6. Patterns as a Composition Tool
sidebar_position: 6
---

# 6. Patterns as a Composition Tool

Patterns are pre-built block compositions. You've likely used them as starter content — inserting a pre-designed hero section or pricing table that gets copied into the page. But patterns can also serve a structural role in templates, keeping complex block markup organized and maintainable.

## Learning Outcomes

1. Know the difference between a pattern used for starter content and one used to compose templates.
2. Understand all pattern metadata fields — Title, Slug, Categories, Post Types, Block Types, Template Types, Inserter visibility.
3. Know how `Block Types` triggers "Choose a pattern" modals for Query Loops, template parts, and post content.
4. Be able to create a pattern with conditional PHP and use it inside a template.

## Two roles for patterns

### Starter content

The `10up-block-theme` ships one pattern — `patterns/card.php`. It's a post card with a featured image, title, date, and category terms. When an editor inserts it, the block markup is **copied** into the post. There's no ongoing link — editing the pattern file later won't update existing instances.

The scaffold version renders a simple 16/9 card with date and category metadata. Its `index.html` references it directly:

```html title="templates/index.html (scaffold)"
<!-- wp:post-template {"layout":{"type":"grid","columnCount":null,"minimumColumnWidth":"21rem"}} -->

<!-- wp:pattern {"slug":"tenup-theme/base-card"} /-->

<!-- /wp:post-template -->
```

`Inserter: false` means it won't appear in the block inserter — it's designed to be referenced from templates, not manually inserted by editors.

### Template composition

The `fueled-movies` theme evolves the scaffold's card and adds a second composition pattern.

**Trailer embed** — `patterns/single-movie-trailer.php` conditionally renders an IMDB trailer embed or a placeholder image based on post meta:

```php title="patterns/single-movie-trailer.php"
<?php
/**
 * Title: Single Movie Trailer
 * Slug: tenup-theme/single-movie-trailer
 * Description: A trailer embed with a fallback image.
 * Inserter: false
 *
 * @package FueledMoviesTheme
 */

$trailer_id = get_post_meta( get_the_ID(), 'tenup_movie_trailer_id', true );

if ( empty( $trailer_id ) || is_admin() ) :

    echo '<!-- wp:image {"sizeSlug":"large"} -->
        <figure class="wp-block-image size-large">
            <img src="https://placehold.co/1600x900/2a2721/898989.jpg?text=placeholder" alt=""/>
        </figure>
    <!-- /wp:image -->';

else :

    $url = 'https://www.imdb.com/video/embed/' . $trailer_id . '/';

    echo '<!-- wp:html -->
        <iframe
            src="' . esc_url( $url ) . '"
            allowfullscreen
            loading="lazy"
            style="width:100%;aspect-ratio:16/9;height:auto;border:0;"
        ></iframe>
    <!-- /wp:html -->';

endif;
```

**Evolving the base card** — The scaffold's `card.php` is a static 16/9 blog card. The `fueled-movies` theme modifies it to handle multiple post types using PHP conditionals:

```php title="patterns/card.php (simplified)"
<?php
/**
 * Title: Base Card
 * Slug: tenup-theme/base-card
 * Description: A card pattern with a featured image, title, and contextual metadata. Adapts layout based on post type.
 * Inserter: false
 *
 * @package FueledMoviesTheme
 */

$post_type = get_post_type();
$is_movie  = $post_type === 'tenup-movie';
$is_person = $post_type === 'tenup-person';

if ( $is_movie || $is_person ) :
?>

<!-- Poster card: 2:3 aspect, background color, compact spacing -->
<!-- wp:group { ... poster card wrapper ... } -->

    <!-- wp:post-featured-image {"aspectRatio":"2/3"} /-->
    <!-- wp:post-title {"isLink":true,"fontSize":"heading-4"} /-->

    <?php if ( $is_movie ) : ?>
        <!-- rating row: ★ 8.7 / ☆ Rate -->
        <!-- trailer button -->
    <?php endif; ?>

<!-- /wp:group -->

<?php else : ?>

<!-- Blog card: 16/9 aspect, border, date + category -->
<!-- wp:group { ... blog card wrapper ... } -->

    <!-- wp:post-featured-image {"aspectRatio":"16/9","displayFallback":true} /-->
    <!-- wp:post-title {"isLink":true,"fontSize":"heading-4"} /-->
    <!-- wp:post-date /-->
    <!-- wp:post-terms {"term":"category"} /-->

<!-- /wp:group -->

<?php endif; ?>
```

All three archive templates reference the same pattern:

```html title="templates/index.html, archive-tenup-movie.html, archive-tenup-person.html"
<!-- wp:pattern {"slug":"tenup-theme/base-card"} /-->
```

One pattern, three templates. Movies get the poster layout with rating and trailer. People get the poster with just a name. Blog posts get the original 16/9 card with date and category. The PHP conditionals `get_post_type()` run in the context of each post inside the query loop, so the card automatically adapts.

This is the shift from "patterns as convenience" to **patterns as architecture**:

- Each pattern encapsulates a self-contained piece of layout logic
- Templates stay readable by delegating complex markup to patterns
- Changes to the card design happen in one file and propagate everywhere

:::tip
Because patterns are PHP files, you can use any PHP logic — conditional rendering, `get_post_meta()`, `get_template_directory_uri()` for asset paths, `get_post_type()` for post-type-aware behavior. The only rule is that the output must be valid block markup.
:::

## Pattern metadata reference

The PHP file header tells WordPress everything about the pattern:

```php
<?php
/**
 * Title: My Pattern                    ← Required. Display name in the inserter.
 * Slug: tenup-theme/my-pattern         ← Required. Unique identifier.
 * Description: A helpful description   ← Optional. Shown in the inserter UI.
 * Categories: text, featured           ← Optional. Inserter categories.
 * Keywords: video, embed               ← Optional. Search terms for discoverability.
 * Block Types: core/query              ← Optional. Triggers "Choose a pattern" modals.
 * Post Types: page                     ← Optional. Restricts to specific post types.
 * Template Types: single, page         ← Optional. Suggests for template creation.
 * Inserter: false                      ← Optional. Hides from the inserter.
 * Viewport Width: 1200                 ← Optional. Preview width in the inserter.
 * Source: theme                        ← Optional. Origin identifier (theme or plugin).
 */
?>
```

### Inserter

`Inserter: false` hides the pattern from the inserter UI while keeping it usable via `<!-- wp:pattern -->` references. Use this for structural patterns that only make sense in a specific template context — like our `base-card` and `single-movie-trailer`.

### Post Types

Restricts the pattern to specific post types. The pattern only appears in the inserter when editing that post type. Comma-separated for multiple types:

```php
Post Types: tenup-movie, tenup-person
```

### Categories

Determines which inserter category the pattern appears under. You can use built-in categories (`text`, `featured`, `gallery`, etc.) or register custom categories with `register_block_pattern_category()`.

### Block Types — "Choose a pattern" modals

This is the most powerful metadata field. `Block Types` connects a pattern to a specific block type, causing it to appear in contextual modals when that block is inserted or replaced.

#### Query Loop patterns (`core/query`)

When you add `Block Types: core/query` to a pattern, two things happen:

1. **Insert modal** — When an editor inserts a new Query Loop block and clicks **Choose**, a "Choose a pattern" modal appears showing all patterns with `Block Types: core/query`. The pattern replaces the default query layout.
2. **Replace button** — Existing Query Loop blocks show a **Replace** button in the toolbar that opens the same modal.

```php title="patterns/movie-grid.php (example)"
<?php
/**
 * Title: Movie Grid
 * Slug: tenup-theme/movie-grid
 * Block Types: core/query
 * Post Types: tenup-movie
 */
?>

<!-- wp:query {"query":{"postType":"tenup-movie","inherit":true},"align":"wide"} -->
<div class="wp-block-query alignwide">
    <!-- wp:post-template {"layout":{"type":"grid","minimumColumnWidth":"13rem"}} -->
    <!-- wp:pattern {"slug":"tenup-theme/base-card"} /-->
    <!-- /wp:post-template -->

    <!-- wp:query-pagination -->
    <!-- wp:query-pagination-previous /-->
    <!-- wp:query-pagination-next /-->
    <!-- /wp:query-pagination -->
</div>
<!-- /wp:query -->
```

This gives editors a one-click way to insert a fully configured movie grid.

#### Template part patterns (`core/template-part/{area}`)

For header and footer template parts, patterns appear when editors click **Replace** in the template part's toolbar:

```php
Block Types: core/template-part/header
Block Types: core/template-part/footer
```

#### Post content starter patterns (`core/post-content`)

When `Block Types: core/post-content` is combined with `Post Types`, the pattern appears in a "Choose a pattern" modal when creating a new post of that type:

```php title="patterns/movie-review.php (example)"
<?php
/**
 * Title: Movie Review
 * Slug: tenup-theme/movie-review
 * Block Types: core/post-content
 * Post Types: tenup-movie
 */
?>

<!-- wp:heading -->
<h2>Review</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"placeholder":"Write your review..."} -->
<p></p>
<!-- /wp:paragraph -->
```

Every time an editor creates a new Movie post, they'll see a modal offering this as a starting layout.

### Template Types — starter patterns for template creation

`Template Types` controls which patterns appear when an editor creates a new template in the Site Editor (**Appearance > Editor > Templates > Add New**). When a template type has patterns registered for it, a "Choose a pattern" modal appears.

Accepted values match the WordPress template hierarchy:

`index`, `home`, `front-page`, `singular`, `single`, `page`, `archive`, `author`, `category`, `taxonomy`, `date`, `tag`, `attachment`, `search`, `privacy-policy`, `404`

```php title="patterns/404-template.php (example)"
<?php
/**
 * Title: 404 Page
 * Slug: tenup-theme/404-template
 * Template Types: 404
 * Inserter: false
 */
?>

<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">
    <!-- wp:heading {"level":1} -->
    <h1>Page Not Found</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph -->
    <p>The page you're looking for doesn't exist.</p>
    <!-- /wp:paragraph -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

:::caution
Template Type patterns represent **entire templates** (header, content, footer). Post Content patterns (`Block Types: core/post-content`) represent only the content area. Don't mix them up.
:::

### Summary table

| Field | Purpose | Triggers modal? |
|-------|---------|----------------|
| `Block Types: core/query` | Pattern appears when inserting/replacing a Query Loop | Yes — "Choose a pattern" on insert and Replace button |
| `Block Types: core/template-part/header` | Pattern appears when replacing a header template part | Yes — Replace in toolbar |
| `Block Types: core/post-content` | Pattern appears when creating a new post (combine with `Post Types`) | Yes — "Choose a pattern" on new post |
| `Template Types: 404, single` | Pattern appears when creating a new template of that type in the Site Editor | Yes — "Choose a pattern" on new template |
| `Post Types: tenup-movie` | Restricts pattern to the inserter for that post type only | No — filters existing inserter |
| `Inserter: false` | Hides from inserter entirely; only usable via `<!-- wp:pattern -->` | No — removes from inserter |

## Using a pattern in a template

Reference a pattern from a template using the pattern block:

```html
<!-- wp:pattern {"slug":"tenup-theme/single-movie-trailer"} /-->
```

When WordPress renders the template, it executes the pattern's PHP and inserts the resulting block markup. This happens on every page load — unlike inserted patterns (which are copied once), template-referenced patterns are **always fresh**.

This distinction matters: if you update the pattern file, all templates referencing it get the update immediately. No need to re-save posts.

## Tasks

1. **Read both patterns.** Compare `card.php` (adaptive card with post-type conditionals) and `single-movie-trailer.php` (trailer embed with post meta). Note the PHP header metadata and how each uses PHP logic differently.

2. **Trace the base card.** Open `card.php`. Find the `get_post_type()` conditional and the three branches (movie, person, default). Then open `archive-tenup-movie.html`, `archive-tenup-person.html`, and `index.html` — all three use `<!-- wp:pattern {"slug":"tenup-theme/base-card"} /-->`. Understand why movies show the rating/trailer, people show just a name, and blog posts show date/category.

> 📷 **Screenshot suggestion**: The movie archive (poster cards with rating + trailer) next to the person archive (poster cards with just the name) next to the blog index (16/9 cards with date) — same pattern, three different outputs.

4. **Create a starter pattern.** Create a pattern with `Block Types: core/post-content` and `Post Types: tenup-movie`. Create a new Movie post and verify the "Choose a pattern" modal appears.

5. **Create a query pattern.** Create a pattern with `Block Types: core/query` that includes a full query loop. Insert a new Query Loop block in a template and verify the "Choose a pattern" modal shows your pattern.

## Takeaways

- Patterns serve two roles: starter content (copied and detached) or template composition (referenced, always fresh).
- `Inserter: false` hides a pattern from the inserter while keeping it usable via `<!-- wp:pattern -->` references in templates.
- PHP patterns can use conditional logic (`get_post_type()`, `get_post_meta()`, `is_admin()`) to render different output based on context.
- `Block Types: core/query` triggers a "Choose a pattern" modal when inserting or replacing a Query Loop.
- `Block Types: core/post-content` + `Post Types` triggers a "Choose a pattern" modal when creating a new post of that type.
- `Template Types` triggers a "Choose a pattern" modal when creating a new template in the Site Editor.
- Template-referenced patterns re-execute on every page load. Inserted patterns are copied once.
- One pattern can serve multiple templates — use `get_post_type()` and other PHP conditionals to adapt output based on context. Evolve scaffold patterns rather than creating duplicates.

## Ship it checkpoint

- Two patterns exist in `patterns/`: `card.php` (adaptive card) and `single-movie-trailer.php` (conditional trailer embed)
- All archive templates and the blog index reference `base-card` via `<!-- wp:pattern -->`
- The base card renders poster layout with rating/trailer for movies, poster with just title for people, and 16/9 with date/category for blog posts

## Further reading

- [Block Patterns Overview](/reference/Patterns/overview)
- [Patterns lesson (Blocks training)](../Blocks/04-patterns.md)
- [Synced Patterns](/reference/Patterns/synced-patterns)
- [Block Type Patterns (WordPress Theme Handbook)](https://developer.wordpress.org/themes/patterns/block-type-patterns/)
- [Starter Patterns (WordPress Theme Handbook)](https://developer.wordpress.org/themes/patterns/starter-patterns/)
