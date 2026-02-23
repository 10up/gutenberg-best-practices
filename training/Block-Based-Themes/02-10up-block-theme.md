---
sidebar_label: 2. Using the 10up Block Theme
sidebar_position: 2
---

# 2. Using the 10up Block Theme

Now that your environment is set up, let's take a look at our theme directory.

We'll be using the 10up Block Theme as our starting point. The theme is a scaffold — a pre-configured starting point that gives you a solid foundation rather than starting from scratch. It comes with:

- **10up-toolkit** — a zero-config webpack-based build pipeline that handles CSS and JS compilation, block asset detection, and hot reloading
- **Auto-enqueue block CSS** — drop a CSS file into `assets/css/blocks/{namespace}/{block-name}.css` and it loads only when the block is present on the page
- **Auto-register custom blocks** — create a folder with a `block.json` in `blocks/` and it's automatically registered
- **Three editor style scopes** — frame, canvas, and frontend stylesheets are already wired up with the correct enqueue hooks
- **PostCSS with globals and mixins** — custom media queries and mixins are available across all style entry points without manual imports
- **PHP framework integration** — uses the [10up `ModuleInterface`](/reference/Themes/10up-theme#php-framework) pattern for organized, auto-discovered PHP modules
- **Sensible CSS architecture** — organized into base, blocks, components, globals, mixins, templates, and utilities

## Learning Outcomes

1. Understand the theme's directory structure and the purpose of each folder.
2. Know where CSS, JS, blocks, templates, patterns, and PHP source files live.
3. Understand the three editor style scopes and where each is enqueued.
4. Be able to trace an asset from source to browser.

## Theme structure

```bash
cd themes/10up-block-theme
```

The theme root is structured like so. We'll take a quick walk through each directory and talk about their structure and purpose.

<details>
<summary>View tree</summary>

```bash
10up-block-theme/
├── .eslintrc
├── .lintstagedrc.json
├── .stylelintignore
├── LICENSE.md
├── composer.json
├── composer.lock
├── functions.php
├── package.json
├── phpcs.xml
├── screenshot.png
├── style.css
├── stylelint.config.js
├── template-tags.php
├── theme.json
├── assets/
│   ├── css/
│   │   ├── base/
│   │   │   ├── align.css
│   │   │   ├── index.css
│   │   │   ├── layout.css
│   │   │   └── reset.css
│   │   ├── blocks/
│   │   │   └── core/
│   │   │       └── image.css
│   │   ├── components/
│   │   │   └── index.css
│   │   ├── editor-canvas-style-overrides.css
│   │   ├── editor-frame-style-overrides.css
│   │   ├── frontend.css
│   │   ├── globals/
│   │   │   ├── media-queries.css
│   │   │   └── readme.md
│   │   ├── mixins/
│   │   │   ├── margin-trim.css
│   │   │   ├── readme.md
│   │   │   └── visually-hidden.css
│   │   ├── templates/
│   │   │   └── index.css
│   │   └── utilities/
│   │       ├── index.css
│   │       └── visually-hidden.css
│   ├── fonts/
│   ├── images/
│   ├── js/
│   │   ├── block-extensions.js
│   │   └── frontend.js
│   └── svg/
├── blocks/
├── parts/
│   ├── footer.html
│   ├── header.html
│   ├── site-footer-legal-navigation-area.html
│   └── site-header-navigation-area.html
├── patterns/
│   └── card.php
├── src/
│   ├── Assets.php
│   ├── Blocks.php
│   ├── TemplateTags.php
│   └── ThemeCore.php
├── styles/
│   ├── surface-primary.json
│   ├── surface-secondary.json
│   └── surface-tertiary.json
└── templates/
    ├── 404.html
    ├── index.html
    ├── single.html
    └── singular.html
```

</details>

## `assets/css`

```bash
├── assets/
│   ├── css/
│   │   ├── base/
│   │   │   ├── align.css
│   │   │   ├── index.css
│   │   │   ├── layout.css
│   │   │   └── reset.css
│   │   ├── blocks/
│   │   │   └── core/
│   │   │       └── image.css
│   │   ├── components/
│   │   │   └── index.css
│   │   ├── editor-canvas-style-overrides.css
│   │   ├── editor-frame-style-overrides.css
│   │   ├── frontend.css
│   │   ├── globals/
│   │   │   ├── media-queries.css
│   │   │   └── readme.md
│   │   ├── mixins/
│   │   │   ├── margin-trim.css
│   │   │   ├── readme.md
│   │   │   └── visually-hidden.css
│   │   ├── templates/
│   │   │   └── index.css
│   │   └── utilities/
│   │       ├── index.css
│   │       └── visually-hidden.css
```

### `/base`

Contains foundational CSS files that establish the theme's base styles. The `reset.css` provides a modern CSS reset, `layout.css` handles basic layout utilities, `align.css` manages block alignment styles, and `index.css` serves as the entry point that imports all base styles.

### `/blocks`

The 10up Block theme provides a nice feature where files placed here are only enqueued when the block is present on the page, improving performance and keeping our site lean.

To use, add a directory using the block name prefix (e.g., `core/` or `jetpack/`) and use the block suffix as your file name to place block-specific styles there. The theme will automatically detect and load these styles only when the corresponding block is used.

:::tip
For example, to style the core Separator block: create `assets/css/blocks/core/separator.css`. After rebuilding, that stylesheet will only load on pages that contain a Separator block.
:::

### `/components`

Useful for reusable component styles that can be used across different parts of the theme. Unlike block-scoped CSS, component styles load globally via `frontend.css`. Use this for styles that span multiple blocks or don't map neatly to a single block — things like card layouts, header styles, or button overrides.

### `/globals`

We recommend that you check out the `README.md` placed here (or anywhere you see one in the theme) but the TL;DR is that these files are not meant to produce CSS output directly. They are intended for use with PostCSS and the files placed here become available to all style entry points in the theme.

This allows for using the `@custom-media` variables here within the theme's `/blocks` directory without needing to import the `media-queries.css` file anywhere, for example using `@media(--bp-medium) {}` in `10up-block-theme/blocks/example-block/style.css`. Another example might be creating a `globals/custom-selectors.css` file for [PostCSS custom selectors](https://www.npmjs.com/package/postcss-custom-selectors).

### `/mixins`

As with the `globals` directory, these files do not produce output and are merely for making mixins accessible to use throughout the theme. For example the provided utility mixin `visually-hidden.css` gives screen reader-only styles that can be used where we might not have markup access to provide the `visually-hidden` class name, such as third party form elements.

### `/templates`

Intended for styles related to the theme templates. All styles here are on the frontend so they can all live in `index.css` or be partitioned out into `single-post.css` or `404.css` etc. if you like.

### `/utilities`

These are typically single-purpose classes that can be applied directly to blocks or elements for quick styling adjustments. `visually-hidden` is one such example and utilizes the mixin mentioned above.

### Editor and frontend files

The CSS files placed directly in `assets/css/` provide the main theme style entry and some editor adjustments. Understanding these three files is key to working with the scaffold:

| File | Scope | Loaded via | Purpose |
|------|-------|-----------|---------|
| `frontend.css` | Frontend (and editor canvas) | `wp_enqueue_scripts` + `add_editor_style()` | Main theme styles — imports base, components, utilities, templates |
| `editor-frame-style-overrides.css` | Editor frame only | `enqueue_block_editor_assets` | Styles for the editor chrome _outside_ the editing canvas (toolbar, sidebar) |
| `editor-canvas-style-overrides.css` | Editor canvas only | `enqueue_block_assets` (admin only) | Styles inside the canvas iframe — things like making the post title look like part of the editor UI |

:::tip
This is the single most confusing concept for newcomers: the editor has **two CSS scopes**. The "frame" is everything outside the editing area. The "canvas" is the iframe where blocks render. `frontend.css` is loaded in the canvas via `add_editor_style()` so blocks look the same in the editor as they do on the frontend. The frame and canvas are separate and have different stylesheets.
:::

## `assets/js`

```bash
├── assets/
│   ├── js/
│   │   ├── block-extensions.js
│   │   └── frontend.js
```

### `block-extensions.js`

This file is enqueued only in the editor and should be used for common block and editor modifications such as registering styles and variations, creating block filters, or adding document plugin panels.

### `frontend.js`

This file imports `frontend.css` and can also be used for any JS you might need on the frontend. It is recommended to enqueue any of the theme's block-specific JS within their `block.json` files, but any non-block JS should go here.

## Assets — Fonts, Images, and SVG

Other theme assets can be placed here such as brand logos or font files you wish to enqueue via theme.json.

## `blocks/`

Any custom blocks you wish to create for your theme can be placed here and will be automatically registered within the editor. For a comprehensive look at the structure of a custom block, please see the Blocks course [1. Anatomy of a block](../Blocks/01-overview.md).

As mentioned, it is generally recommended to keep CSS and JS together with your custom blocks, placing all relevant files within the blocks directory. This might look something like the following:

```bash
├── blocks/
│   ├── example-block/
│   │   ├── block.json
│   │   ├── edit.js
│   │   ├── editor-style.css
│   │   ├── index.js
│   │   ├── markup.php
│   │   ├── style.css
│   │   └── view-module.js
```

And then in your custom block's `block.json` file:

```json
{
    "editorScript": "file:./index.js",
    "editorStyle": "file:./editor-style.css",
    "render": "file:./markup.php",
    "style": "file:./style.css",
    "viewScriptModule": "file:./view-module.js"
}
```

:::tip
At 10up we use dynamic blocks — blocks that render on the server via PHP. The `markup.php` file (referenced as `render` in block.json) is where your block's frontend HTML lives. This avoids block deprecation headaches since the markup isn't saved to the database.
:::

## `parts/`

Template parts are reusable chunks of block markup — headers, footers, sidebars, or anything you want to share across templates. They live in the `parts/` directory as `.html` files.

```bash
├── parts/
│   ├── footer.html
│   ├── header.html
│   ├── site-footer-legal-navigation-area.html
│   └── site-header-navigation-area.html
```

The scaffold ships with a header, footer, and two smaller area parts (navigation areas that are referenced from within the header and footer). You reference a part from a template like this:

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
```

We'll go deeper into templates and parts in an upcoming lesson.

## `patterns/`

Patterns are pre-built block compositions that can be inserted into posts, pages, or templates. They're registered via PHP files in the `patterns/` directory using a file header comment for metadata.

```bash
├── patterns/
│   └── card.php
```

The scaffold ships with one pattern — `card.php` — which is a post card with a featured image, title, date, and category terms. It's set to `Inserter: false` because it's designed to be referenced from templates rather than inserted by editors directly.

```php
<?php
/**
 * Title: Base Card
 * Slug: tenup-theme/base-card
 * Description: A card pattern with a featured image, title, date, and category.
 * Inserter: false
 */
?>

<!-- wp:group { ... } -->
<!-- block markup here -->
<!-- /wp:group -->
```

The PHP header tells WordPress the pattern's title, slug, description, and whether it should appear in the inserter. Setting `Inserter: false` is a common pattern for compositions that only make sense in a specific template context.

## `src/`

The `src/` directory contains the theme's PHP modules. These classes use the [10up PHP framework](https://github.com/10up/wp-framework) — specifically the `ModuleInterface` and `Module` trait — to auto-discover and register themselves when the theme initializes.

```bash
├── src/
│   ├── Assets.php
│   ├── Blocks.php
│   ├── TemplateTags.php
│   └── ThemeCore.php
```

### `ThemeCore.php`

The bootstrap class. It's instantiated in `functions.php` and kicks off everything: loads the text domain, adds theme support for `editor-styles`, loads `frontend.css` into the editor canvas via `add_editor_style()`, removes core block patterns (so only your own patterns are available), and auto-discovers all other modules in `src/` using `ModuleInitialization`.

### `Assets.php`

Handles all asset enqueuing. This is where the three style scopes come together:

- `enqueue_frontend_assets()` — loads `frontend.css` and `frontend.js` on the frontend
- `enqueue_block_editor_assets()` — loads `editor-frame-style-overrides.css` and `block-extensions.js` in the editor frame
- `enqueue_block_editor_iframe_assets()` — loads `editor-canvas-style-overrides.css` inside the editor canvas iframe

### `Blocks.php`

Two responsibilities:

1. **Auto-registers custom blocks** — globs `dist/blocks/*/block.json` and calls `register_block_type_from_metadata()` for each.
2. **Auto-enqueues block CSS** — globs `dist/blocks/autoenqueue/**/*.css` and registers each stylesheet with `wp_enqueue_block_style()` so it only loads when the block is present.

This is the code behind the `assets/css/blocks/` convention described above.

### `TemplateTags.php`

A small utility module that adds the viewport meta tag to the document head. You can extend this with any other template-level helpers your theme needs.

:::tip
Every module in `src/` implements `ModuleInterface` with three methods: `can_register()` (should this module load?), `register()` (hook in), and `load_order()` (priority). Drop a new PHP class in `src/` that implements this interface and it will be auto-discovered — no manual registration needed.
:::

## `styles/`

The `styles/` directory holds [style variations](https://developer.wordpress.org/themes/global-settings-and-styles/style-variations/) — JSON files that let editors choose from pre-built design options in the block editor's Styles panel.

```bash
├── styles/
│   ├── surface-primary.json
│   ├── surface-secondary.json
│   └── surface-tertiary.json
```

The scaffold ships with three Group block variations (primary, secondary, tertiary) that can be applied via the block inspector. Each file follows a simple structure:

```json
{
    "$schema": "https://schemas.wp.org/wp/6.7/theme.json",
    "version": 3,
    "title": "Primary",
    "slug": "primary",
    "blockTypes": ["core/group"],
    "styles": {
        "color": {}
    }
}
```

The `blockTypes` array determines which blocks the variation appears on, and the `styles` object contains the design tokens to apply. You'll fill in colors, spacing, borders, etc. as your design requires.

:::caution
Style variations are JSON files in `styles/`. They are different from JS-registered block styles (which use `registerBlockStyle`). Both show up in the inspector, but they work differently under the hood. Style variations can target nested elements and support the full `theme.json` styles schema. JS-registered block styles only add a class name.
:::

## `templates/`

Templates are the HTML files that define your theme's page layouts. They follow the standard [WordPress template hierarchy](https://developer.wordpress.org/themes/basics/template-hierarchy/) — the same rules you know from PHP templates, but with `.html` files containing block markup.

```bash
├── templates/
│   ├── 404.html
│   ├── index.html
│   ├── single.html
│   └── singular.html
```

| Template | Resolves to | Purpose |
|----------|-------------|---------|
| `index.html` | The default fallback | Blog index / main query loop |
| `single.html` | Single posts | Single post layout |
| `singular.html` | Single posts and pages | Fallback for any singular content |
| `404.html` | Not found | Error page |

Each file is composed of block markup — the same `<!-- wp: -->` comments you'd see in the code editor view of any block. Templates reference template parts for shared sections:

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">
    <!-- wp:post-content /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

:::tip
The best way to create and edit templates is through the Site Editor — not by hand. Use the [Create Block Theme](https://wordpress.org/plugins/create-block-theme/) plugin to export your visual changes back to the theme files.
:::

As you build out your theme, you'll add more templates for custom post types (like `single-tenup-movie.html` or `archive-tenup-person.html`). Register them in `theme.json` under `customTemplates` so the editor knows they exist.

## `theme.json`

The final key file at the theme root. As covered in the [previous lesson](./01-overview.md#themejson), `theme.json` is the source of truth for design tokens and editor settings — not for all your styles.

The scaffold's `theme.json` ships with:

- **Spacing presets** — a fluid scale from 2px to 160px using `clamp()` for responsive values
- **Layout settings** — content and wide widths with viewport-aware calculations
- **Typography** — system font stack and fluid type configuration
- **Custom properties** — viewport calculations, scrollbar width detection, and site padding tokens
- **Template parts** — header and footer registration

The color palette is intentionally left empty for you to define. We'll cover `theme.json` in depth in a later lesson.

## Takeaways

- The 10up Block Theme scaffold gives you a pre-configured build pipeline, CSS architecture, and PHP module system out of the box.
- CSS is organized into purpose-specific directories: `base`, `blocks`, `components`, `globals`, `mixins`, `templates`, and `utilities`.
- The `blocks/` CSS directory auto-enqueues per-block — styles only load when the block is present.
- The editor has three CSS scopes: **frame** (chrome outside the canvas), **canvas** (the iframe where blocks render), and **frontend** (the actual site). Getting these confused is the #1 gotcha.
- PHP modules in `src/` auto-discover via `ModuleInterface` — drop in a new class and it registers itself.
- Style variations in `styles/` give editors controlled design choices via JSON.
- Templates in `templates/` follow the WordPress template hierarchy but use block markup instead of PHP.
- Use the Site Editor and [Create Block Theme](https://wordpress.org/plugins/create-block-theme/) plugin to compose templates visually — don't hand-author block markup.

## Further reading

- [10up Block Theme scaffold](https://github.com/10up/wp-scaffold)
- [Block Based Templates](/reference/Themes/block-based-templates)
- [Block Template Parts](/reference/Themes/block-template-parts)
- [Styles Reference](/reference/Themes/styles)
- [Theme.json Reference](/reference/Themes/theme-json)
