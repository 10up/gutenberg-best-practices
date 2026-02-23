---
sidebar_label: "5. Styles: CSS Architecture and Style Variations"
sidebar_position: 5
---

# 5. Styles — CSS Architecture and Style Variations

This lesson combines two related topics: how the scaffold organizes and code-splits CSS, and how style variations give editors controlled design choices.

## Learning Outcomes

1. Understand the autoenqueue pipeline: `assets/css/blocks/{namespace}/{block-name}.css` → loaded only when the block is present.
2. Know the difference between block CSS, component CSS, and base CSS.
3. Know what style variations are (`styles/{block-type}/{slug}.json`) and how they differ from JS-registered block styles.
4. Be able to create a style variation and a code-split block stylesheet.

## Part A: Code-split CSS

### How autoenqueue works

WordPress already code-splits its own block styles — it only loads `image` CSS when an Image block is present on the page. The 10up scaffold piggybacks on this mechanism.

Here's the pipeline:

1. You create a CSS file at `assets/css/blocks/core/separator.css`
2. `10up-toolkit` compiles it to `dist/blocks/autoenqueue/core/separator.css`
3. `src/Blocks.php` globs `dist/blocks/autoenqueue/` and registers each file with `wp_enqueue_block_style()`
4. WordPress only loads it on pages where the corresponding block is present

The relevant code in `src/Blocks.php`:

```php title="src/Blocks.php (simplified)"
public function enqueue_theme_block_styles() {
    $stylesheets = glob( FUELED_MOVIES_THEME_DIST_PATH . '/blocks/autoenqueue/**/*.css' );

    foreach ( $stylesheets as $stylesheet_path ) {
        // Extract block type from path: "core/separator"
        $block_type = str_replace( FUELED_MOVIES_THEME_DIST_PATH . '/blocks/autoenqueue/', '', $stylesheet_path );
        $block_type = str_replace( '.css', '', $block_type );

        wp_register_style( "tenup-theme-{$block_type}", /* ... */ );

        wp_enqueue_block_style(
            $block_type,
            [
                'handle' => "tenup-theme-{$block_type}",
                'path'   => $stylesheet_path,
            ]
        );
    }
}
```

The `path` parameter is important — it tells WordPress the local filesystem path so it can inline the stylesheet directly in the HTML `<head>` as critical CSS (for stylesheets under 20KB).

### The CSS architecture

The scaffold organizes CSS into purpose-specific directories. Here's how to decide where a new stylesheet belongs:

| Directory | Loads | When to use | Example |
|-----------|-------|-------------|---------|
| `blocks/core/` | Per-block (autoenqueue) | Styling a core block | `separator.css`, `post-terms.css` |
| `blocks/{namespace}/` | Per-block (autoenqueue) | Styling a third-party block | `jetpack/contact-form.css` |
| `components/` | Globally via `frontend.css` | Styles that span multiple blocks | `card.css`, `header.css` |
| `base/` | Globally via `frontend.css` | Foundational resets and layout | `reset.css`, `layout.css` |
| `utilities/` | Globally via `frontend.css` | Single-purpose utility classes | `visually-hidden.css`, `layout.css` |
| `templates/` | Globally via `frontend.css` | Template-specific styles | `index.css` |

**Block-scoped vs global**: If a style only matters when a specific block is on the page, put it in `blocks/`. If it affects multiple blocks or the overall page, it belongs in `components/` or `base/`.

### What fueled-movies adds

The `fueled-movies` theme adds 5 core block stylesheets and 3 component stylesheets. Here are a couple of examples to show the pattern:

```css title="assets/css/blocks/core/separator.css"
.wp-block-separator {
    border-color: var(--wp--custom--color--background--light-transparent-10, rgba(163, 163, 163, 0.15));
    border-top-width: 1px;
}
```

```css title="assets/css/blocks/core/group.css"
.wp-block-group {
    &.has-separator {
        gap: 0;

        & > *:not(:first-child)::before {
            background-color: currentcolor;
            block-size: 4px;
            border-radius: 999px;
            content: "";
            display: inline-flex;
            inline-size: 4px;
            margin-inline: var(--wp--custom--spacing--8);
        }
    }
}
```

The Group block styles only load on pages that contain a Group block. The separator between items (the dot-separator you see on the single movie template between release year, MPA rating, and runtime) only adds CSS weight where it's actually used.

Meanwhile, component styles load globally because they need to be available everywhere:

```css title="assets/css/components/card.css"
.wp-block-post {
    position: relative;

    & .wp-block-post-title a::after {
        bottom: 0;
        content: "";
        display: flex;
        height: 100%;
        left: 0;
        position: absolute;
        width: 100%;
        z-index: 1;
    }
}
```

This is the "overlay link trick" — an absolutely positioned pseudo-element that makes the entire card clickable, not just the title text.

## Part B: Style variations

### What are style variations?

Style variations are JSON files in the `styles/` directory that give editors selectable design options in the block inspector's Styles panel. They use the `theme.json` schema and can target the full range of design tokens: colors, spacing, borders, shadows, and nested elements.

The `10up-block-theme` ships three global "surface" variations for the Group block. The `fueled-movies` theme replaces these with targeted per-block variations:

```json title="styles/button/secondary.json"
{
    "$schema": "https://schemas.wp.org/wp/6.9/theme.json",
    "version": 3,
    "title": "Secondary",
    "slug": "secondary",
    "blockTypes": ["core/button"],
    "styles": {
        "elements": {
            "button": {
                "color": {
                    "background": "var(--wp--custom--color--background--light-transparent-10)",
                    "text": "var(--wp--custom--color--text--primary)"
                },
                "shadow": "0 1px 2px 0 rgba(255, 255, 255, 0.08) inset",
                ":hover": {
                    "color": {
                        "background": "var(--wp--custom--color--background--light-transparent-20)"
                    }
                }
            }
        }
    }
}
```

```json title="styles/group/secondary.json"
{
    "$schema": "https://schemas.wp.org/wp/6.9/theme.json",
    "version": 3,
    "title": "Secondary",
    "slug": "test-secondary",
    "blockTypes": ["core/group"],
    "styles": {
        "border": {
            "radius": "10px"
        },
        "color": {
            "background": "var(--wp--custom--color--background--light-transparent-5)"
        },
        "spacing": {
            "padding": {
                "top": "var(--wp--custom--spacing--32)",
                "right": "var(--wp--custom--spacing--32)",
                "bottom": "var(--wp--custom--spacing--32)",
                "left": "var(--wp--custom--spacing--32)"
            }
        }
    }
}
```

The `blockTypes` array determines which blocks the variation appears on. The `styles` object uses the same schema as `theme.json` styles.

### Style variations vs JS block styles

Both show up in the editor's Styles panel, but they work very differently:

| Feature | Style variations (JSON) | Block styles (JS) |
|---------|------------------------|-------------------|
| Format | JSON file in `styles/` | `registerBlockStyle()` in JS |
| What it does | Applies `theme.json`-style design tokens | Adds a CSS class name |
| Can target nested elements | Yes (`elements.button`, `elements.link`) | No |
| Can set spacing, borders, shadows | Yes | No — only via the added class in CSS |
| Registration | Automatic from file system | Manual via `registerBlockStyle()` or `unregisterBlockStyle()` |

The `fueled-movies` theme also uses `unregisterBlockStyle()` in `assets/js/block-styles/index.js` to remove core block styles it doesn't want:

```js title="assets/js/block-styles/index.js (partial)"
import { unregisterBlockStyle } from '@wordpress/blocks';
import domReady from '@wordpress/dom-ready';

domReady(() => {
    unregisterBlockStyle('core/button', 'fill');
    unregisterBlockStyle('core/button', 'outline');
    unregisterBlockStyle('core/separator', 'default');
    unregisterBlockStyle('core/separator', 'wide');
    unregisterBlockStyle('core/separator', 'dots');
    // ... more removals
});
```

This keeps the editor clean — only intentional style choices are available.

:::caution
Button style variations are a known pain point. The editor and frontend markup differ slightly, so `elements.link` vs `elements.button` targeting may not behave the same in both contexts. Always test both.
:::

## Tasks

### Part A: Code-split CSS

1. **Trace the autoenqueue pipeline.** Open `src/Blocks.php` and find the `enqueue_theme_block_styles()` method. Follow how it globs `dist/blocks/autoenqueue/` and calls `wp_enqueue_block_style()`.

2. **Add a new core block stylesheet.** Create `assets/css/blocks/core/quote.css` with some visible styling (e.g. a colored left border). Rebuild.

3. **Verify code-splitting.** Load a page with a Quote block — your styles should load. Load a page without one — they shouldn't. Use DevTools Network tab to confirm.

> 📷 **Screenshot suggestion**: DevTools Network panel showing the block-specific stylesheet loading on one page but not another. This is the "aha" moment for code-splitting.

4. **Compare with component CSS.** Look at `assets/css/components/button.css` — it loads globally via `frontend.css`. Understand when to use block-scoped CSS vs component CSS.

### Part B: Style variations

5. **Read the existing variations.** Open `styles/group/secondary.json` and `styles/button/secondary.json`. Note the structure: `title`, `slug`, `blockTypes`, and nested `styles` object.

6. **Create a Group variation.** Add `styles/group/highlight.json` with a distinct background and border. Rebuild and verify it appears in the editor's Styles panel.

> 📷 **Screenshot suggestion**: The Styles panel in the block inspector showing the new "Highlight" variation alongside "Default" and "Secondary".

7. **Create a Button variation.** Add `styles/button/outline.json`. Target the inner `.wp-block-button__link` via `elements.button`, not the outer wrapper.

8. **Test in both scopes.** Verify your variations work in the editor canvas and on the frontend.

## Takeaways

- Block-scoped CSS loads per-block. Component CSS loads globally. Choose intentionally.
- WordPress inlines small stylesheets as critical CSS — block-scoped CSS benefits from this automatically.
- Style variations are JSON files that give editors controlled styling choices.
- Button variations need to target `elements.button`, not the wrapper.
- Use `unregisterBlockStyle()` to remove core styles you don't want.
- A block should never have more than 4 style variations. Keep them intentional.

## Ship it checkpoint

- A core block stylesheet is code-split and only loads when the block is present
- A Group and Button style variation are selectable in the editor and work on the frontend

## Further reading

- [Anatomy of a block based theme](./01-overview.md) (section on writing CSS for individual blocks)
- [Styles Reference](/reference/Themes/styles)
- [Block Styles](/reference/Blocks/block-styles)
