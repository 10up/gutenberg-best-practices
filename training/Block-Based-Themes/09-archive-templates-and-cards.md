---
sidebar_label: 9. Archive Templates and the Card Pattern
sidebar_position: 9
---

# 9. Archive Templates and the Card Pattern

Build archive pages for Movies and People, and create an adaptive card pattern that renders differently based on post type. This lesson combines templates and patterns into one hands-on exercise.

## Learning Outcomes

1. Be able to build archive templates with Query Loop, Post Template, and pagination.
2. Know how patterns work as template composition tools (always fresh, not copied).
3. Understand how PHP conditionals in patterns adapt output to post type context.
4. Know the difference between a pattern used for starter content and one used for template composition.

## Tasks

### 1. Create the Movie Archives template

Open the Site Editor. Create the Movie Archives template:

- Add header/footer template parts
- Add a Query Loop block, set post type to `tenup-movie`, order by title ascending
- Add a Post Template with grid layout (`minimumColumnWidth: 13rem`)
- Add a Query Pagination block with arrow style

Use "Copy All Blocks" to copy the markup and paste it into `templates/archive-tenup-movie.html`.

```html title="templates/archive-tenup-movie.html"
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"0","bottom":"0"},
    "padding":{"top":"var(--wp--preset--spacing--32-48)","bottom":"var(--wp--preset--spacing--32-48)"}}},
    "layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:query {"query":{"postType":"tenup-movie","order":"asc","orderBy":"title","inherit":true},"align":"wide"} -->
    <div class="wp-block-query alignwide">
        <!-- wp:post-template {"layout":{"type":"grid","columnCount":null,"minimumColumnWidth":"13rem"}} -->
        <!-- wp:pattern {"slug":"tenup-theme/base-card"} /-->
        <!-- /wp:post-template -->

        <!-- wp:query-pagination {"paginationArrow":"arrow","align":"wide"} -->
        <!-- wp:query-pagination-previous /-->
        <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

### 2. Create the Person Archives template

Repeat the same pattern for `templates/archive-tenup-person.html` with post type `tenup-person`.

### 3. Update the blog index template

Update `templates/index.html`:

- Add a Query Title block (archive title)
- Change from the scaffold's inline card markup to a `<!-- wp:pattern {"slug":"tenup-theme/base-card"} /-->` reference
- Update perPage to 10

### 4. Evolve the card pattern

The scaffold ships a simple `patterns/card.php` with a featured image, title, date, and category. We'll evolve it to handle multiple post types using PHP conditionals.

```php title="patterns/card.php (structure)"
$post_type = get_post_type();
$is_movie  = 'tenup-movie' === $post_type;
$is_person = 'tenup-person' === $post_type;

if ( $is_movie || $is_person ) :
    // Poster card: 2:3 aspect, transparent background, 10px radius, 12px padding
    // Wrapping Group has is-clickable-card class
    // Post featured image + post title (isLink:true)
    // Movie-only: viewer rating row
    // Shared button: "Trailer" for movies, "View More" for persons (is-style-secondary, 100% width)
else :
    // Blog card: 16/9 image, 1px border, 8px radius
    // Wrapping Group has is-clickable-card class
    // Post title (isLink:true) + post date + post terms (category)
endif;
```

Copy the complete `patterns/card.php` from the fueled-movies theme. The key design decisions:

- **`is-clickable-card` class** on the wrapping Group enables the JS-based clickable card behavior from [Lesson 5](./05-styles.md)
- **`isLink: true`** on the post title makes the heading a link, which serves as the primary clickable target for accessibility (screen readers announce the post title)
- **Movie-specific viewer rating row** uses a block binding (`viewerRatingLabelTextNumberOnly`) that won't exist until [Lesson 10](./10-block-bindings.md). It will show empty until then.
- **Shared secondary button**: movies show "Trailer," persons show "View More" via a PHP ternary

All three archive templates reference the same pattern:

```html
<!-- wp:pattern {"slug":"tenup-theme/base-card"} /-->
```

One pattern, three templates. The PHP conditionals `get_post_type()` run in the context of each post inside the query loop, so the card automatically adapts.

TODO_SUGGEST_SCREENSHOT

### How patterns work in templates

When a template references a pattern via `<!-- wp:pattern {"slug":"..."} /-->`, the pattern's PHP file re-executes on every page load. This is different from patterns inserted into posts, which are copied and detached.

This means:
- Changes to the pattern file propagate immediately to all templates that reference it
- PHP conditionals run in context (the current post type, post ID, etc.)
- No need to re-save posts after changing the pattern

:::tip
Because patterns are PHP files, you can use any PHP logic: conditional rendering, `get_post_meta()`, `get_template_directory_uri()` for asset paths, `get_post_type()` for post-type-aware behavior. The only rule is that the output must be valid block markup.
:::

## Pattern metadata reference

The PHP file header tells WordPress about the pattern:

```php
<?php
/**
 * Title: Base Card
 * Slug: tenup-theme/base-card
 * Description: A card pattern with a featured image, title, and contextual metadata.
 * Inserter: false
 */
```

`Inserter: false` hides the pattern from the inserter while keeping it usable via `<!-- wp:pattern -->` references. Use this for structural patterns that only make sense in a specific template context.

## Notes

- Cards in the archive editor won't match the frontend perfectly because `wp_template` is the post context in the editor, not individual movies/people. This is a known limitation worth calling out.
- The card pattern includes a viewer rating row using the `viewerRatingLabelTextNumberOnly` binding for movie cards. This binding doesn't exist until Lesson 10, so it will show empty until then.

## Files changed (fueled-movies delta)

| File | Change type | What changes |
| ---- | ----------- | ------------ |
| `templates/archive-tenup-movie.html` | **New** | Query loop for `tenup-movie`, grid layout, base-card pattern, pagination |
| `templates/archive-tenup-person.html` | **New** | Query loop for `tenup-person`, grid layout, base-card pattern, pagination |
| `templates/index.html` | Modified | Added query-title, changed to base-card pattern reference, perPage 10 |
| `patterns/card.php` | Modified | Added `get_post_type()` conditional: movie/person poster card and default blog card |

## Ship it checkpoint

- `/movies/` shows a poster grid of movies
- `/people/` shows a poster grid of people
- Blog index shows 16/9 cards with date and category
- All three archives use the same `base-card` pattern

TODO_SUGGEST_SCREENSHOT

## Takeaways

- Archive templates compose a Query Loop with a pattern reference for the card.
- Patterns referenced via `<!-- wp:pattern -->` re-execute on every page load, staying in sync with the source file.
- PHP conditionals in patterns let one card pattern adapt to multiple post types.
- `Inserter: false` hides structural patterns from the inserter while keeping them usable in templates.
- The `is-clickable-card` class and heading link work together for accessible card interactions.

## Further reading

- [Block Patterns Overview](/reference/Patterns/overview)
- [Patterns lesson (Blocks training)](../Blocks/04-patterns.md)
- [Block Type Patterns (WordPress Theme Handbook)](https://developer.wordpress.org/themes/patterns/block-type-patterns/)
