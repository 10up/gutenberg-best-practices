---
sidebar_label: "5. Styles: CSS Architecture and Style Variations"
sidebar_position: 5
---

# 5. Styles: CSS Architecture and Style Variations

This lesson combines two related topics: how the scaffold organizes and code-splits CSS, and how style variations give editors controlled design choices.

## Learning Outcomes

1. Understand the autoenqueue pipeline: `assets/css/blocks/{namespace}/{block-name}.css` loads only when the block is present.
2. Know the difference between block CSS, component CSS, and base CSS.
3. Know what style variations are (`styles/{block-type}/{slug}.json`) and how they differ from JS-registered block styles.
4. Be able to create a style variation and a code-split block stylesheet.

## Part A: Copy CSS from the finished theme

Most of the CSS in this lesson is straightforward styling. Rather than writing every file from scratch, copy the CSS files from the `fueled-movies` answer-key theme and review the file table below to understand what each file does.

### The CSS architecture

The scaffold organizes CSS into purpose-specific directories:

| Directory | Loads | When to use | Example |
| --------- | ----- | ----------- | ------- |
| `blocks/core/` | Per-block (autoenqueue) | Styling a core block | `separator.css`, `post-terms.css` |
| `blocks/{namespace}/` | Per-block (autoenqueue) | Styling a third-party block | `jetpack/contact-form.css` |
| `components/` | Globally via `frontend.css` | Styles that span multiple blocks | `card.css`, `header.css` |
| `base/` | Globally via `frontend.css` | Foundational resets and layout | `reset.css`, `layout.css` |
| `utilities/` | Globally via `frontend.css` | Single-purpose utility classes | `visually-hidden.css` |
| `templates/` | Globally via `frontend.css` | Template-specific styles | `index.css` |
| `globals/` | Not output directly | PostCSS variables available everywhere | `media-queries.css` |
| `mixins/` | Not output directly | PostCSS mixins available everywhere | `visually-hidden.css` |

**Block-scoped vs global**: if a style only matters when a specific block is on the page, put it in `blocks/`. If it affects multiple blocks or the overall page, it belongs in `components/` or `base/`.

### How autoenqueue works

1. You create a CSS file at `assets/css/blocks/core/separator.css`
2. `10up-toolkit` compiles it to `dist/blocks/autoenqueue/core/separator.css`
3. `src/Blocks.php` globs `dist/blocks/autoenqueue/` and registers each file with `wp_enqueue_block_style()`
4. WordPress only loads it on pages where the corresponding block is present

The `path` parameter in `wp_enqueue_block_style()` tells WordPress the local filesystem path so it can inline the stylesheet directly in the HTML `<head>` as critical CSS (for stylesheets under 20KB).

### Editor and frontend CSS scopes

The CSS files directly in `assets/css/` provide the main theme style entry and some editor adjustments:

| File | Scope | Loaded via | Purpose |
| ---- | ----- | ---------- | ------- |
| `frontend.css` | Frontend (and editor canvas) | `wp_enqueue_scripts` + `add_editor_style()` | Main theme styles, imports base/components/utilities/templates |
| `editor-frame-style-overrides.css` | Editor frame only | `enqueue_block_editor_assets` | Styles for the editor chrome outside the editing canvas (toolbar, sidebar) |
| `editor-canvas-style-overrides.css` | Editor canvas only | `enqueue_block_assets` (admin only) | Styles inside the canvas iframe, e.g. making the post title look like part of the editor UI |

:::tip
The editor has **two CSS scopes**. The "frame" is everything outside the editing area. The "canvas" is the iframe where blocks render. `frontend.css` is loaded in the canvas via `add_editor_style()` so blocks look the same in the editor as they do on the frontend. The frame and canvas override files are separate.
:::

### Files to copy from fueled-movies

Copy these files into your `10up-block-theme`:

- `assets/css/base/html.css` (new)
- `assets/css/base/layout.css` (modified, adds `accent-color`, `@view-transition`)
- `assets/css/base/index.css` (modified, adds `@import url("html.css")`)
- `assets/css/components/header.css`, `card.css`, `button.css` (new)
- `assets/css/components/index.css` (modified, adds imports)
- `assets/css/mixins/is-clickable-card.css` (new)
- `assets/css/blocks/core/separator.css`, `post-featured-image.css`, `post-terms.css`, `group.css` (new)
- `assets/css/utilities/layout.css` (new)
- `assets/css/utilities/visually-hidden.css` (modified, adds `.is-hidden`)
- `assets/css/utilities/index.css` (modified, adds import)
- `assets/js/clickable-cards.js` (new)
- `assets/js/frontend.js` (modified, adds `import './clickable-cards'`)

:::info
`is-style-single-movie-backdrop` styles in `post-featured-image.css` won't be visually testable until we build the single templates in [Lesson 10](./10-block-bindings.md). The `.has-separator` styles in `group.css` won't have a toggle until [Lesson 11](./11-block-extensions.md). Both are harmless CSS that we're placing now.
:::

After copying, run `npm run build` and verify the site looks styled.

### Key CSS patterns

**Sticky header** (`assets/css/components/header.css`):

```css
header:where(.wp-block-template-part) {
    backdrop-filter: saturate(180%) blur(20px);
    background-color: var(--wp--custom--color--background--nav);
    inset-block-start: var(--wp-admin--admin-bar--height, 0);
    isolation: isolate;
    position: sticky;
    z-index: 1000;

    & .wp-block-site-title {
        font-family: "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 21px;
        font-weight: 600;
        letter-spacing: 0.011em;
        line-height: 1.1428;
    }
}
```

**Genre pill styling** (`assets/css/blocks/core/post-terms.css`):

```css
.wp-block-post-terms {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wp--custom--spacing--12);

    & .wp-block-post-terms__separator { display: none; }

    & [rel="tag"] {
        background: var(--wp--custom--color--background--light-transparent-10);
        border-radius: 45px;
        color: var(--wp--custom--color--text--primary);
        padding: 8px 18px;
        text-decoration: none;
        transition: background-color 0.2s ease;

        &:hover { background: var(--wp--custom--color--background--light-transparent-20); }
    }
}
```

**Has-separator dots** (`assets/css/blocks/core/group.css`):

```css
.wp-block-group.has-separator {
    gap: 0;

    & > * {
        align-items: center;
        display: flex;
    }

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
```

### Clickable cards

The `assets/js/clickable-cards.js` file is an accessibility-focused pattern based on [Inclusive Components](https://inclusive-components.design/cards/#theredundantclickevent). Add the `is-clickable-card` class to the card's wrapping Group in the pattern, and the JS makes the entire card clickable by forwarding clicks to the primary link (the post title heading link). It handles text selection, scroll detection, and Ctrl/Cmd+click. Students just need to copy the files.

The heading link provides good screen reader context since it contains the post title. The `is-clickable-card` class is added via the "Additional CSS class(es)" panel in the block editor. This is fine because the card pattern is code-only (`Inserter: false`), so editors never interact with it. **If this were an editor-facing block, a block extension with a toggle control would be better** since classes added via the Additional CSS panel can be accidentally deleted with no way for editors to know how to restore them.

Card hover CSS (`assets/css/components/card.css`) uses the mixin from `assets/css/mixins/is-clickable-card.css` to apply hover feedback. The title starts with a transparent underline and transitions to `currentcolor` on card hover (smooth underline reveal). The secondary button gets its hover state. This is why `theme.json` doesn't set `textDecoration: none` on link hover, as that would fight the CSS transition.

```css title="assets/css/components/card.css"
.is-clickable-card .wp-block-post-title {
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: text-decoration-color 0.2s ease;
}

.is-clickable-card {

    @mixin is-clickable-card-hover {

        [data-is-clickable-card-primary] {
            text-decoration-color: currentcolor;
        }

        .wp-block-button [data-is-clickable-card-secondary] {
            background-color: var(--wp--custom--color--background--light-transparent-20, rgba(163, 163, 163, 0.3));
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25) inset;
        }
    }
}
```

The `@mixin is-clickable-card-hover` is defined in `assets/css/mixins/is-clickable-card.css` and encapsulates the `:has()` hover selector, excluding secondary interactive elements from triggering the card hover:

```css title="assets/css/mixins/is-clickable-card.css"
@define-mixin is-clickable-card-hover {
    &:where(:hover:not(:has([data-is-clickable-card-secondary]:hover, [data-is-clickable-card-secondary]:focus))) {
        @mixin-content;
    }
}
```

## Part B: Style variations

### What are style variations?

Style variations are JSON files in the `styles/` directory that give editors selectable design options in the block inspector's Styles panel. They use the `theme.json` schema and can target the full range of design tokens: colors, spacing, borders, shadows, and nested elements.

### Hands-on: create style variations

The `10up-block-theme` ships three global "surface" variations for the Group block. We'll replace these with targeted per-block variations.

1. **Delete** `styles/surface-primary.json`, `styles/surface-secondary.json`, and `styles/surface-tertiary.json`.

2. **Create `styles/button/secondary.json`**: transparent background, primary text, inset shadow:

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
                    "background": "var(--wp--custom--color--background--light-transparent-10, rgba(163, 163, 163, 0.15))",
                    "text": "var(--wp--custom--color--text--primary)"
                },
                "shadow": "0 1px 2px 0 rgba(255, 255, 255, 0.08) inset",
                ":hover": {
                    "color": {
                        "background": "var(--wp--custom--color--background--light-transparent-20, rgba(163, 163, 163, 0.3))"
                    },
                    "shadow": "0 2px 2px 0 rgba(0, 0, 0, 0.25) inset"
                },
                ":focus": {
                    "color": {
                        "background": "var(--wp--custom--color--background--light-transparent-20, rgba(163, 163, 163, 0.3))"
                    },
                    "shadow": "0 2px 2px 0 rgba(0, 0, 0, 0.25) inset"
                }
            }
        }
    }
}
```

Explain the JSON structure: `$schema`, `version`, `title`, `slug`, `blockTypes`, and `styles.elements.button`.

3. **Create `styles/group/secondary.json`**: 10px radius, transparent background, 32px padding.

4. **Rebuild and verify**: "Secondary" style appears for Button and Group blocks in the editor.

TODO_SUGGEST_SCREENSHOT

### Style variations vs JS block styles

Both show up in the editor's Styles panel, but they work very differently:

| Feature | Style variations (JSON) | Block styles (JS) |
| ------- | ---------------------- | ----------------- |
| Format | JSON file in `styles/` | `registerBlockStyle()` in JS |
| What it does | Applies `theme.json`-style design tokens | Adds a CSS class name |
| Can target nested elements | Yes (`elements.button`, `elements.link`) | No |
| Can set spacing, borders, shadows | Yes | No, only via the added class in CSS |
| Registration | Automatic from file system | Manual via JS |

:::caution
Button style variations are a known pain point. The `core/button` block renders differently in the editor vs the frontend (the editor uses an `<a>` element inside `.wp-block-button` while the frontend may use a `<button>` or `<a>`). This means the style variation JSON may not apply as expected in all editor contexts. Always test both the editor and frontend.
:::

## Files changed (fueled-movies delta)

| File | Change type | What changes |
| ---- | ----------- | ------------ |
| `assets/css/base/html.css` | **New** | `a, button { transition: all 0.2s ease-in-out; }` |
| `assets/css/base/layout.css` | Modified | Added `accent-color` on `html`; added `@view-transition { navigation: auto; }` |
| `assets/css/base/index.css` | Modified | Added `@import url("html.css")` |
| `assets/css/components/header.css` | **New** | Sticky header with `backdrop-filter`, nav background, z-index, site-title font styling |
| `assets/css/components/card.css` | **New** | Full-height groups, cursor utilities, clickable card hover styles via mixin |
| `assets/css/mixins/is-clickable-card.css` | **New** | Encapsulates `:has()` hover selector excluding secondary interactive elements |
| `assets/js/clickable-cards.js` | **New** | JS-based clickable card utility, forwards clicks to primary heading link |
| `assets/css/components/button.css` | **New** | `.wp-element-button` flex alignment with gap, pointer cursor |
| `assets/css/components/index.css` | Modified | Added imports: `./header.css`, `./card.css`, `./button.css` |
| `assets/css/blocks/core/separator.css` | **New** | Custom border-color using transparent token, 1px top border |
| `assets/css/blocks/core/post-featured-image.css` | **New** | `flex-shrink: 0`; `.is-style-single-movie-backdrop` blurred backdrop effect |
| `assets/css/blocks/core/post-terms.css` | **New** | Genre pill styling with transparent background, rounded borders |
| `assets/css/blocks/core/group.css` | **New** | `.has-separator` dot pseudo-elements between children |
| `assets/css/utilities/layout.css` | **New** | `.flex-shrink-0 { flex-shrink: 0; }` |
| `assets/css/utilities/visually-hidden.css` | Modified | Added `.is-hidden { display: none; }` |
| `assets/css/utilities/index.css` | Modified | Added `@import url("layout.css")` |
| `styles/surface-primary.json` | **Removed** | Replaced by targeted per-block variations |
| `styles/surface-secondary.json` | **Removed** | Replaced by targeted per-block variations |
| `styles/surface-tertiary.json` | **Removed** | Replaced by targeted per-block variations |
| `styles/button/secondary.json` | **New** | Secondary button: transparent bg, primary text, inset shadow |
| `styles/group/secondary.json` | **New** | Secondary group: 10px radius, transparent bg, 32px padding |

## Ship it checkpoint

- Sticky header with backdrop blur
- Card overlay links work (entire card is clickable)
- Separator CSS only loads on pages with separators (verify in DevTools)
- "Secondary" style appears for Button and Group blocks in the editor

TODO_SUGGEST_SCREENSHOT

## Takeaways

- Block-scoped CSS loads per-block via `assets/css/blocks/`. Component CSS loads globally via `frontend.css`. Choose intentionally.
- WordPress inlines small stylesheets as critical CSS. Block-scoped CSS benefits from this automatically.
- Style variations are JSON files that give editors controlled styling choices. They support the full `theme.json` styles schema.
- Button variations need to target `elements.button`, not the wrapper.
- Clickable cards use JS-based progressive enhancement for accessibility. The heading link is the primary link (good screen reader context), and the entire card surface is clickable.

## Further reading

- [Anatomy of a block based theme](./01-overview.md) (section on writing CSS for individual blocks)
- [Styles Reference](/reference/Themes/styles)
- [Block Styles](/reference/Blocks/block-styles)
