---
sidebar_label: 9. Archive Templates and the Card Block
sidebar_position: 9
---

# 9. Archive Templates and the Card Block

Build archive pages for Movies and People. We'll reference a custom Card block that renders differently based on post type, and look at why a block beats a pattern once render logic needs to survive a round trip through the editor.

## Learning Outcomes

1. Be able to build archive templates with Query Loop, Post Template, and pagination.
2. Know how to reference a custom block (with attribute variations) from a template.
3. Understand why patterns with PHP logic are risky once content passes through the editor.
4. Know what belongs at the top level of `patterns/` versus in a subdirectory like `patterns/images/`.

## Tasks

### 1. Update the Movie Archives template

We created placeholder archive templates in [Lesson 3](./03-site-editor.md#5-create-placeholder-templates). Now we'll refine them.

:::info
It is often much easier to make changes to template files visually using the Site Editor and you are welcome to do so here.  However, since we only need to change a couple of things, it may be a good exercise to work on editing a template manually.
:::

Open `templates/archive-tenup-movie.html` and make three changes:

1. **Remove the placeholder heading** (`<!-- wp:heading -->Archive: Movies<!-- /wp:heading -->`)
2. **Change the Query attributes** from `"order":"desc","orderBy":"date"` to `"order":"asc","orderBy":"title"`
3. **Change the Post Template attribute** `minimumColumnWidth` from `"21rem"` to `"13rem"` so the cards fit more per row

Your updated template should look like this:

```html title="templates/archive-tenup-movie.html"
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"var(--wp--preset--spacing--32-48)","bottom":"var(--wp--preset--spacing--32-48)"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--32-48);padding-bottom:var(--wp--preset--spacing--32-48)">

    <!-- wp:query {"queryId":0,"query":{"perPage":9,"postType":"tenup-movie","order":"asc","orderBy":"title","inherit":true},"align":"wide"} -->
    <div class="wp-block-query alignwide">

        <!-- wp:post-template {"layout":{"type":"grid","columnCount":null,"minimumColumnWidth":"13rem"}} -->

            <!-- wp:tenup/card {"variant":"movie"} /-->

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

The `<!-- wp:tenup/card {"variant":"movie"} /-->` line references the Card custom block with its `variant` attribute set. The block itself is built in [Lesson 12](./12-custom-blocks.md). Until then the archive will show a missing-block placeholder where each card would render. That's expected.

### 2. Update the Person Archives template

Make the same changes to `templates/archive-tenup-person.html`, but set `"variant":"person"` on the Card block reference.

:::info
You could even copy and paste `templates/archive-tenup-movie.html` directly to `archive-tenup-person.html` and it would still work.

This is because the Query attributes set `"inherit":true` which means it will use context from the WP hierarchy and ignore the `postType` attribute here.

However to avoid confusion, it is still recommended to set the proper `postType` attribute.
:::

### 3. Why a custom block, not a pattern?

The scaffold ships a simple `patterns/card.php`. The obvious next step would be to extend it with PHP conditionals on `get_post_type()` so movies, people, and blog posts each render slightly different inner content. WordPress supports that. The pattern PHP file would re-execute on every page load, and the conditionals would pick the right shape for whatever post the query loop is iterating over.

We're not going to do that. Here's why.

#### A pattern's PHP only runs at evaluation time

Once a pattern is inserted into a post, or once a template is opened in the Site Editor and exported back to a `.html` file via "Copy all blocks", the PHP runs **once** and the resolved block markup is what gets stored. The PHP call is gone from the saved copy. Whatever logic it expressed is frozen at the moment of evaluation.

For a contrived example, imagine a Hero pattern that loads its background image from the theme directory:

```php title="patterns/hero.php (illustrative; not in our theme)"
<?php
/**
 * Title: Hero
 * Slug: tenup-theme/hero
 * Inserter: true
 */
?>

<!-- wp:image -->
<figure class="wp-block-image">
    <img src="<?php echo esc_url( get_theme_file_uri( 'patterns/images/hero-bg.jpg' ) ); ?>" alt="" />
</figure>
<!-- /wp:image -->
```

When an editor inserts this pattern into a post and saves, the post's stored block markup looks something like:

```html
<!-- wp:image -->
<figure class="wp-block-image">
    <img src="https://example.com/wp-content/themes/fueled-movies/patterns/images/hero-bg.jpg" alt="" />
</figure>
<!-- /wp:image -->
```

The `get_theme_file_uri()` call is gone. The URL is hardcoded into the saved post. Two things follow from this:

1. Rename the image, change CDN config, or switch themes, and every previously inserted Hero block points at a stale URL with no way for WordPress to know.
2. The same hazard applies to **anything** PHP-driven inside a pattern: `get_post_meta()` reads, `get_post_type()` conditionals, queries against related posts. The moment that pattern's resolved output hits the editor, the dynamic behavior stops being dynamic.

Templates that include a pattern via `<!-- wp:pattern -->` *do* re-execute the PHP on each request, so this is fine until someone opens the template in the Site Editor and clicks "Copy all blocks" to export updates back to the theme. The exported markup contains the resolved values, not the pattern reference, and the round trip silently flattens the logic.

#### A custom block keeps `render.php` as the source of truth

The Card block we'll consume below (and build in [Lesson 12](./12-custom-blocks.md)) takes a different approach. The saved markup is always:

```html
<!-- wp:tenup/card {"variant":"movie"} /-->
```

That's all that round-trips through the editor. The actual rendering happens server-side via the block's `render.php` on every request, against the current post in the query loop. There's no resolved markup to flatten, because there's no resolved markup stored anywhere. Whatever the block renders today, it will keep rendering tomorrow.

:::tip
WordPress only registers `.php` files at the **top level** of `patterns/` as patterns. Subdirectories like `patterns/images/` are safe homes for related assets such as the contrived `hero-bg.jpg` above. The folder name does not matter; only top-level `.php` files get scanned.
:::

### 4. The variant inner patterns

The Card block doesn't render its inner content directly. Instead, it looks up one of three patterns based on the value of its `variant` attribute:

| Variant slug | File | What it renders |
| ------------ | ---- | --------------- |
| `default` | `patterns/card-inner-default.php` | Featured image, title, post date, category terms |
| `movie` | `patterns/card-inner-movie.php` | Featured image, title, viewer rating row (binding), Trailer button |
| `person` | `patterns/card-inner-person.php` | Featured image, title, View More button |

All three are registered with `Inserter: false` so they never appear in the inserter. They exist purely as source markup that the Card block expands inside its editor preview and renders on the frontend. We'll see how the block looks them up in [Lesson 12](./12-custom-blocks.md).

Copy the three `card-inner-*.php` files from the `fueled-movies` theme into your `patterns/` directory now, and delete the original `patterns/card.php`. The archive templates updated above (`wp:tenup/card`) will start rendering correctly once the block exists.

```php title="patterns/card-inner-movie.php (header only)"
<?php
/**
 * Title: Card Inner - Movie
 * Slug: tenup-theme/card-inner-movie
 * Description: Inner content for the movie variant of the tenup/card block.
 * Inserter: false
 */
```

The `Slug` is what the Card block's editor preview looks up by name; the convention `tenup-theme/card-inner-{variant}` mirrors the block's variant attribute so the lookup stays mechanical.

## Notes

- Cards in the archive editor won't match the frontend perfectly because `wp_template` is the post context in the editor, not individual movies/people. This is a known limitation worth calling out.
- The Movie variant includes a viewer rating row using the `viewerRatingLabelTextNumberOnly` binding. This binding doesn't exist until Lesson 10, so it will show empty until then.
- The Card block itself is built in Lesson 12. Until then, the archive templates will show a missing-block placeholder where each card would render. This is expected.

## Files changed in this lesson

| File | Change type | What changes |
| ---- | ----------- | ------------ |
| `templates/archive-tenup-movie.html` | Modified | Removed placeholder heading, updated grid column width and query order, swapped the `wp:pattern` reference for `<!-- wp:tenup/card {"variant":"movie"} /-->` |
| `templates/archive-tenup-person.html` | Modified | Same as movie archive; variant set to `person` |
| `patterns/card.php` | **Removed** | Replaced by the `tenup/card` custom block (Lesson 12) and the per-variant inner patterns below |
| `patterns/card-inner-default.php` | **New** | Inner content for the default Card variant |
| `patterns/card-inner-movie.php` | **New** | Inner content for the Movie Card variant |
| `patterns/card-inner-person.php` | **New** | Inner content for the Person Card variant |

:::info
To sync your theme with the finished product, run these commands:

```bash
cp themes/fueled-movies/templates/archive-tenup-movie.html themes/10up-block-theme/templates/archive-tenup-movie.html
cp themes/fueled-movies/templates/archive-tenup-person.html themes/10up-block-theme/templates/archive-tenup-person.html
rm themes/10up-block-theme/patterns/card.php
cp themes/fueled-movies/patterns/card-inner-default.php themes/10up-block-theme/patterns/card-inner-default.php
cp themes/fueled-movies/patterns/card-inner-movie.php themes/10up-block-theme/patterns/card-inner-movie.php
cp themes/fueled-movies/patterns/card-inner-person.php themes/10up-block-theme/patterns/card-inner-person.php
```

:::

## Ship it checkpoint

- `/movies/` and `/people/` load their archive templates with the query loop in place
- Each iteration of the query loop shows a missing-block placeholder for `tenup/card` (resolved in Lesson 12)
- `patterns/card.php` has been removed
- The three `card-inner-{variant}.php` patterns exist at the top level of `patterns/`

:::tip[Bonus: What about index.html?]
We haven't touched the blog index template yet. The scaffold's `templates/index.html` references the original `tenup-theme/base-card` pattern that we just removed, so it will need the same `<!-- wp:tenup/card {"variant":"default"} /-->` swap to render correctly once Lesson 12 builds the block.

If you'd like to make it your own, open it in the Site Editor and experiment. Add a heading, tweak the grid column width, change the query type to custom and use one of our new post types. This is your template, do whatever you want with it.
:::

## Takeaways

- Archive templates compose a Query Loop with either a pattern reference or a custom block per iteration.
- A pattern's PHP runs at evaluation time. Once its resolved markup hits the editor, the dynamic behavior is lost.
- Custom blocks keep `render.php` as the source of truth across editor round-trips. Use them whenever render logic needs to keep running.
- WordPress only registers `.php` files at the top level of `patterns/`. Subdirectories like `patterns/images/` are safe for related assets.
- `Inserter: false` hides structural patterns from the inserter while keeping them available to be consumed by a block (as the Card block does in Lesson 12) or a template.
- The `is-clickable-card` class and heading link work together for accessible card interactions.

## Further reading

- [Block Patterns Overview](/reference/Patterns/overview)
- [Patterns lesson (Blocks training)](../Blocks/04-patterns.md)
- [Block Type Patterns (WordPress Theme Handbook)](https://developer.wordpress.org/themes/patterns/block-type-patterns/)
