---
sidebar_label: 3. Templates, Template Parts, and the Site Editor
sidebar_position: 3
---

# 3. Templates, Template Parts, and the Site Editor

In the [previous lesson](./02-10up-block-theme.md) we explored the theme's directory structure. Now let's focus on the files that define what visitors actually see: templates and template parts.

## Learning Outcomes

1. Understand the relationship between HTML template files and the Site Editor.
2. Know how to create, edit, and export templates and parts.
3. Understand why block markup must be valid — no arbitrary HTML in templates.
4. Know when to use a template vs a template part vs a pattern.

## Templates

Templates are the HTML files that define your theme's page layouts. They live in the `templates/` directory and follow the same [template hierarchy](https://developer.wordpress.org/themes/basics/template-hierarchy/) you already know from classic themes — except they use `.html` files containing block markup instead of `.php` files with PHP template tags.

The `10up-block-theme` ships with four core templates:

| Template | Resolves to | Purpose |
|----------|-------------|---------|
| `index.html` | Default fallback | Blog index / main query loop |
| `single.html` | Single posts | Single post layout |
| `singular.html` | Single posts and pages | Fallback for any singular content |
| `404.html` | Not found | Error page |

### Block markup

Every template file is composed of block markup — `<!-- wp: -->` HTML comments that define blocks and their attributes. Here's the basic structure of a template:

```html title="templates/singular.html"
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">
    <!-- wp:post-content /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

This reads top-to-bottom: render the header part, then a `<main>` Group containing the post content, then the footer part.

:::danger
You **cannot use arbitrary HTML** in a block template. It must be valid block markup. If you need custom markup that isn't available via core blocks, create it as a [custom block](../Blocks/01-overview.md).
:::

### Registering custom templates

When you need templates for custom post types, you add them to the `customTemplates` array in `theme.json`. This is how the editor discovers them in the template picker.

The `fueled-movies` theme adds four CPT-specific templates:

```json title="theme.json (partial)"
{
    "customTemplates": [
        {
            "name": "archive-tenup-movie",
            "title": "Movie Archives",
            "postTypes": []
        },
        {
            "name": "single-tenup-movie",
            "title": "Single Movie",
            "postTypes": ["tenup-movie"]
        },
        {
            "name": "archive-tenup-person",
            "title": "Person Archives",
            "postTypes": []
        },
        {
            "name": "single-tenup-person",
            "title": "Single Person",
            "postTypes": ["tenup-person"]
        }
    ]
}
```

The `postTypes` array tells the editor which post types can use this template. Archive templates use an empty array because they aren't assigned to individual posts — they match based on the template hierarchy (`archive-{post-type}.html`).

### A real template: single-tenup-movie.html

Here's a simplified view of the single movie template showing the key structural blocks:

```html title="templates/single-tenup-movie.html (simplified)"
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">

    <!-- Blurry poster backdrop -->
    <!-- wp:post-featured-image {"aspectRatio":"2:3","className":"is-style-single-movie-backdrop"} /-->

    <!-- wp:group {"tagName":"article"} -->
    <article class="wp-block-group">

        <!-- Back button with block binding -->
        <!-- wp:button {"metadata":{"bindings":{...}}} -->...<!-- /wp:button -->

        <!-- Movie title -->
        <!-- wp:post-title {"level":1} /-->

        <!-- Movie metadata (release year, MPA rating, runtime) -->
        <!-- wp:group {"hasSeparator":true} -->
        <div class="wp-block-group has-separator">
            <!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"core/post-meta","args":{"key":"tenup_movie_release_year"}}}}} -->
            <p></p>
            <!-- /wp:paragraph -->
            <!-- ... more bound paragraphs ... -->
        </div>
        <!-- /wp:group -->

        <!-- Video embed pattern -->
        <!-- wp:pattern {"slug":"tenup-theme/single-movie-trailer"} /-->

        <!-- Description list with movie details -->
        <!-- wp:tenup/dl -->...<!-- /wp:tenup/dl -->

    </article>
    <!-- /wp:group -->

</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

Notice how the template composes together several concepts we'll cover in later lessons: block bindings for dynamic data, patterns for reusable sections, and custom blocks for semantic markup. Templates are the glue that brings everything together.

## Template parts

Template parts are reusable chunks of block markup — headers, footers, sidebars, or anything you want to share across templates. They live in the `parts/` directory.

```bash
parts/
├── footer.html
├── header.html
├── site-footer-legal-navigation-area.html
└── site-header-navigation-area.html
```

Parts are referenced from templates using the `template-part` block:

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
```

You register them in `theme.json` under `templateParts`:

```json title="theme.json (partial)"
{
    "templateParts": [
        {
            "area": "header",
            "name": "header",
            "title": "Site Header"
        },
        {
            "area": "footer",
            "name": "footer",
            "title": "Site Footer"
        }
    ]
}
```

The `area` property tells WordPress where this part belongs (header, footer, or uncategorized). This determines which slot the part appears in when editing templates in the Site Editor.

### Parts can reference other parts

Template parts can nest. The scaffold's `header.html` references a separate navigation area part:

```html title="parts/header.html"
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:site-title /-->
        <!-- wp:template-part {"slug":"site-header-navigation-area"} /-->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
```

This keeps each part focused on one concern. The header handles the overall layout, the navigation area handles the menu.

## When to use what

| Concept | Lives in | Ongoing link? | Use when |
|---------|----------|---------------|----------|
| **Template** | `templates/` | N/A | Defining a full page layout |
| **Template part** | `parts/` | Yes — shared across templates | Reusable sections (header, footer) |
| **Pattern** | `patterns/` | Depends on usage | Starter content or template composition |

The key distinction: template parts always maintain a live link. Patterns have two modes — when an editor **inserts** a pattern into a post, the markup is copied and detached. But when a template **references** a pattern via `<!-- wp:pattern {"slug":"..."} /-->`, the pattern re-executes on every page load. This is how the `fueled-movies` theme uses patterns: all three archive templates reference the `base-card` pattern, and the single movie template references the `single-movie-trailer` pattern. Changes to those pattern files propagate immediately. More on this in [Lesson 6](./06-patterns.md).

## The Site Editor and Create Block Theme

The Site Editor (`Appearance > Editor`) is where you visually create and edit templates and parts. Think of it as a visual IDE for your theme's layout.

:::tip
No one should have to hand-author block markup in `.html` files. The Site Editor is the best tool for composing templates. Use the [Create Block Theme](https://wordpress.org/plugins/create-block-theme/) plugin to export your visual changes back to theme files.
:::

The workflow:

1. Open the Site Editor
2. Create or edit a template visually
3. Use Create Block Theme to save changes back to your theme files
4. Commit the updated `.html` files to version control

## Tasks

1. **Inspect an existing template.** Open `templates/index.html` in your code editor and the Site Editor side by side. Identify each `<!-- wp: -->` comment and the block it represents.

> 📷 **Screenshot suggestion**: Side-by-side of the code editor (block markup) and the visual Site Editor rendering of the same template.

2. **Create a new template part.** In the Site Editor, build a new template part (e.g. a banner or sidebar). Export it back to the theme using the Create Block Theme plugin.

> 📷 **Screenshot suggestion**: The Create Block Theme export UI showing the "Save Changes to Theme" option.

3. **Wire it into a template.** Add a `<!-- wp:template-part {"slug":"your-part"} /-->` reference into a template. Verify it renders on the frontend.

4. **Register a custom template.** Add a `customTemplates` entry to `theme.json` for a CPT-specific template. Create the corresponding `.html` file. Verify the template appears in the editor template picker.

## Takeaways

- Templates are HTML files with block markup. The template hierarchy still applies.
- Template parts are reusable chunks (header, footer, sidebars) referenced from templates. They maintain a live link.
- Author templates in the Site Editor and export — don't hand-write block markup.
- `customTemplates` in `theme.json` makes templates visible for specific post types.
- `templateParts` in `theme.json` registers parts with an area assignment.

## Ship it checkpoint

- A real change exists in `templates/` or `parts/` that renders on the frontend
- The change was authored in the Site Editor and exported back to theme files
- Templates remain valid block markup

## Further reading

- [Anatomy of a block based theme](./01-overview.md)
- [Block Based Templates](/reference/Themes/block-based-templates)
- [Block Template Parts](/reference/Themes/block-template-parts)
