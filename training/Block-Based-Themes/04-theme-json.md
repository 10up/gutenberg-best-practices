---
sidebar_label: "4. theme.json: Design Tokens and Settings"
sidebar_position: 4
---

# 4. theme.json — Design Tokens and Settings

There's a misconception that block themes put all their styles in `theme.json`. This is not the case, and fighting core stylesheet specificity is a losing battle.

The rule of thumb: **`theme.json` is the source of truth for design tokens and settings. Actual styles belong in CSS files.**

## Learning Outcomes

1. Know what belongs in `theme.json` (tokens, settings, layout constraints) and what doesn't (actual CSS).
2. Understand the cascade: default → theme → user.
3. Be able to add a new color, spacing size, or typography preset and use it in a template.
4. Know how `theme.json` values become CSS custom properties.

## The cascade

WordPress resolves `theme.json` values in three layers:

1. **Default** — WordPress core ships built-in presets (default palette, default spacing, etc.)
2. **Theme** — Your `theme.json` overrides or extends the defaults
3. **User** — Changes made in the Site Editor's Global Styles panel override the theme

This means an editor can always override your theme's tokens via the Site Editor. That's by design — the theme establishes sensible defaults, and editors customize from there.

## Comparing the two themes

The `10up-block-theme` ships a minimal `theme.json`: spacing presets, layout widths, a system font stack, and some viewport-aware calculations. The color palette is intentionally empty.

The `fueled-movies` theme builds on that foundation significantly. Let's walk through what it adds.

### Color palette

```json title="theme.json (fueled-movies, partial)"
{
    "settings": {
        "color": {
            "defaultPalette": false,
            "palette": [
                {
                    "slug": "yellow",
                    "color": "var(--wp--custom--color--yellow--primary)",
                    "name": "Yellow"
                },
                {
                    "slug": "text-primary",
                    "color": "var(--wp--custom--color--text--primary)",
                    "name": "Text Primary"
                },
                {
                    "slug": "background-primary",
                    "color": "var(--wp--custom--color--background--primary)",
                    "name": "Background Primary"
                }
            ]
        }
    }
}
```

Notice the indirection: palette colors reference `--wp--custom--*` variables rather than hardcoded hex values. This keeps the actual values in one place — the `settings.custom` block — and lets the palette entries act as aliases. Change the custom property, and every palette usage updates automatically.

Setting `defaultPalette: false` removes WordPress's built-in colors from the editor picker. This ensures editors can only use your intentional palette.

### Custom properties (`settings.custom`)

The `settings.custom` block is where you define arbitrary CSS custom properties. WordPress generates `--wp--custom--*` variables from the nested structure:

```json title="theme.json (fueled-movies, partial)"
{
    "settings": {
        "custom": {
            "color": {
                "yellow": {
                    "primary": "#F5C518",
                    "secondary": "#D8C882"
                },
                "text": {
                    "primary": "#C3C3C3",
                    "secondary": "#a3a3a3"
                },
                "background": {
                    "primary": "#0E0E0E",
                    "secondary": "#1A1A1A",
                    "nav": "#080808aa"
                }
            }
        }
    }
}
```

This generates CSS custom properties like:

- `--wp--custom--color--yellow--primary` → `#F5C518`
- `--wp--custom--color--text--primary` → `#C3C3C3`
- `--wp--custom--color--background--primary` → `#0E0E0E`

You can use these anywhere — in CSS files, in `theme.json` style declarations, or via the editor's color controls.

### Custom aspect ratios

```json title="theme.json (fueled-movies, partial)"
{
    "settings": {
        "dimensions": {
            "aspectRatios": [
                {
                    "name": "Movie Poster - 2:3",
                    "ratio": "2:3",
                    "slug": "movie-poster"
                }
            ]
        }
    }
}
```

This adds a "Movie Poster" option to the aspect ratio picker when configuring Image or Featured Image blocks. It sits alongside the built-in ratios (16:9, 4:3, etc.).

### Element-level styles

The `fueled-movies` theme defines default button and link styles at the element level:

```json title="theme.json (fueled-movies, partial)"
{
    "styles": {
        "elements": {
            "button": {
                "color": {
                    "background": "var(--wp--custom--color--action--primary, #f5c518)",
                    "text": "#121212"
                },
                "border": {
                    "radius": "10px"
                },
                "shadow": "0 -2px 2px 0 rgba(0, 0, 0, 0.25) inset",
                ":hover": {
                    "color": {
                        "background": "#ffe99a"
                    }
                }
            },
            "link": {
                "color": {
                    "text": "var(--wp--custom--color--action--secondary)"
                }
            }
        }
    }
}
```

These provide consistent defaults across all buttons and links in the theme. Individual blocks can still override them.

:::caution
Avoid putting layout or visual styles in `theme.json` `styles` beyond element-level defaults. For anything more specific, use CSS. Core stylesheet specificity will fight you otherwise.
:::

### Spacing units

```json title="theme.json (fueled-movies, partial)"
{
    "settings": {
        "spacing": {
            "units": ["px", "em", "rem", "vh", "vw", "%"]
        }
    }
}
```

This controls which spacing units appear in the editor's dimension controls. The scaffold already includes fluid spacing presets using `clamp()` — these generate responsive values that scale between viewport widths.

## How tokens become CSS

Every preset in `theme.json` generates a CSS custom property following a naming convention:

| Setting | CSS variable pattern | Example |
|---------|---------------------|---------|
| `settings.color.palette` | `--wp--preset--color--{slug}` | `--wp--preset--color--yellow` |
| `settings.spacing.spacingSizes` | `--wp--preset--spacing--{slug}` | `--wp--preset--spacing--24` |
| `settings.typography.fontFamilies` | `--wp--preset--font-family--{slug}` | `--wp--preset--font-family--system-font` |
| `settings.custom.*` | `--wp--custom--{path}` | `--wp--custom--color--yellow--primary` |

The key difference: `preset` variables come from defined presets (palette, spacing sizes, font families). `custom` variables come from the `settings.custom` block. Both are equally usable in CSS, but presets also power the editor's UI controls (color picker, spacing controls, etc.).

## Tasks

1. **Compare both theme.json files.** Note what `fueled-movies` adds: palette colors, `settings.custom` properties, element styles, `customTemplates`, and `dimensions.aspectRatios`.

2. **Add a new preset color.** Add a color to `settings.color.palette`, rebuild, and verify it appears in the editor's color picker.

> 📷 **Screenshot suggestion**: The color picker in the block editor showing the custom palette with the newly added color visible.

3. **Use the token.** Apply the new color to a block. Inspect the HTML and find the generated CSS custom property (`--wp--preset--color--your-slug`).

4. **Add a custom property.** Under `settings.custom`, add a value (e.g. a border radius token). Use it in a CSS file via `var(--wp--custom--your-slug)`.

5. **Test the cascade.** Override one of your theme's colors in the Site Editor's Global Styles panel. Refresh and verify the user override wins. Reset it and verify the theme default returns.

## Takeaways

- `theme.json` is for tokens and settings. CSS is for styles.
- Every preset generates a CSS custom property you can use anywhere.
- `settings.custom` creates `--wp--custom--*` variables for anything you need.
- The cascade is default → theme → user. User overrides in the Site Editor win.
- Setting `defaultPalette: false` (and similar `default*: false` flags) removes core presets so only your intentional choices appear.
- Palette colors can reference custom properties for a single source of truth.

## Ship it checkpoint

- A new token is added to `theme.json` and used somewhere
- Removing the token causes an obvious regression

## Further reading

- [Theme.json Reference](/reference/Themes/theme-json)
- [Styles Reference](/reference/Themes/styles)
