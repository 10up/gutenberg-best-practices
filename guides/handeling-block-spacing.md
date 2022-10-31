---
sidebar_label: Handling Block Spacing
---

# Handling Spacing of Blocks

There are many ways to handle the spacing between individual blocks in the editor. This guide focusses on what we've found to work best for most client builds.

This guide is also written for WordPress 6.1 or above because it uses the `spacingScale`/`spacingSizes` settings in `theme.json`.

## Providing sensible defaults

The most important step is to provide sensible default spacing through the themes styling. **The goal here should be that editors shouldn't need to touch the spacing controls in most cases.**

```css
/* provide default spacing for all blocks */
.site-content > * {
	margin-top: var(--wp--custom--spacing--m);
}

.site-content > .alignwide {
	margin-top: var(--wp--custom--spacing--l);
}

.site-content > .alignfull {
	margin-top: var(--wp--custom--spacing--xl);
}

.site-content > .alignfull + .alignfull {
	margin-top: 0;
}

.site-content > :last-child {
	margin-bottom: var(--wp--custom--spacing--xl);
}

.site-content > :last-child.alignfull {
	margin-bottom: 0;
}
```
