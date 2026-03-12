---
sidebar_label: 3. The Site Editor
sidebar_position: 3
---

# 3. The Site Editor

This is your first truly hands-on lesson. You'll use the Site Editor to update the site's navigation and footer, then export the changes back to your theme files.

## Learning Outcomes

1. Know how to navigate the Site Editor UI: Templates, Parts, Styles, and Navigation panels.
2. Be able to edit a template part visually and export the result to the theme.
3. Understand the "Copy All Blocks" workflow for getting markup out of the editor and into `.html` files.
4. Know when to use a template vs. a template part vs. a pattern.

## Context

The `10up-block-theme` ships with a header, footer, and two navigation area parts. The header references a navigation area part, and the footer has a multi-column layout. We'll simplify both to match our movie theme.

```bash
parts/
├── footer.html
├── header.html
├── site-footer-legal-navigation-area.html
└── site-header-navigation-area.html
```

## Tasks

### 1. Tour the Site Editor

Open the Site Editor via **Appearance > Editor**.

![Screenshot of the Site Editor](../../static//img/training/site-editor-default-appearance.png)

Explore the main panels:

- **Styles** - Global Styles panel for design tokens _(colors, typography, spacing)_ as well as managing the appearance of specific blocks throughout the whole of the site
- **Navigation** - manage navigation menus
- **Pages**  - create or edit Pages
- **Templates** - lists all templates in your theme (`index.html`, `single.html`, `404.html`, etc.)
- **Patterns** - reusable sections and template parts

:::info
Note that the Site Editor lists no patterns currently even though the theme contains a `card.php` file in the `/patterns` directory.  This is due to `Inserter: false` property in the files metadata.  Set it `true` for the card to see it display it the editor and revert back to `false` when done.

![Screenshot of the Patterns tab with Card set true](../../static//img/training/site-editor-patterns-display.png)
:::

### 2. Edit the header navigation

1. Open the **Navigation** tab in the Site Editor sidebar.
2. Click the three dots next to **Navigation** and select **Edit**.
3. Open the Document Overview along the top left side and select the **Navigation** block.
4. You can delete the "Page List" block within and then click the plus sign in the content area to **Add block**.
5. From there choose **Add block** again and select **Custom Link**.
6. Type `/movies` and hit **Enter**.  Use the **Edit link** button to change the text to Movies.
7. Follow the same process to create a `/people` custom link.
8. Hit Save.

![Screenshot of the completed Navigation in the editor](../../static//img/training/site-editor-navigation-completed.png)

If you view the frontend of your site, you should see the new items in both your header and footer.

![Screenshot of the completed Navigation on the frontend - header](../../static//img/training/site-editor-navigation-completed-frontend-header.png)
*Frontend header navigation*

![Screenshot of the completed Navigation on the frontend- footer](../../static//img/training/site-editor-navigation-completed-frontend-footer.png)
*Frontend footer navigation*

### 3. Edit the footer

1. Open **Patterns > Template Parts > Footer** in the Site Editor.
2. Replace the existing footer with a different layout. You could modify or delete the Columns block entirely, change the separator style to "Dots", add additional blocks, etc.
3. Have fun playing around, Save your changes, and view the frontend to see it applied.

### 4. Export changes to theme files

Once you're happy with your changes in the Site Editor, you need to get them back into your theme's `.html` files:

From the template part in the Site Editor:

1. Click the Options dropdown (three dots) in the upper right near the Save button.
2. Choose **Copy all blocks**.
   1. Alternatively, you can open the **Code Editor** view (three dots > Code editor, or `Ctrl/Cmd + Shift + Alt + M`) and select all of the block markup and copy it. This is a nice view to be aware of when you wish to make small manual block attribute adjustments.
3. Paste this into the corresponding file in your theme at `parts/footer.html`.
4. **Reset the template part** in the Site Editor sidebar under **Settings > Template Part > Actions (three dots) > Reset**

:::tip
That last step is pretty important, this clears the database customization so the editor reads from the theme file again.
  After pasting markup into a theme file, always reset the template part in the Site Editor. Without resetting, the Site Editor continues to use the database version (your customization), not the theme file. Resetting ensures the editor and the theme file are in sync.
:::

:::info
[Create Bock Theme](https://wordpress.org/plugins/create-block-theme/) is a very handy plugin that can help to manage these steps as well.  We went with the manual approach for this training but it is worth checking out.
:::

![Screenshot of the Options dropdown with relevant items in bold](../../static//img/training/site-editor-footer-options-dropdown.png)
*The Options dropdown with relevant items in bold*

![Screenshot of the reset option](../../static//img/training/site-editor-footer-reset.png)
*The template part Reset button*

:::warning
To keep our training in sync with the finished theme, please use this command to copy the completed version into the 10up Block Theme.

```bash
cp themes/fueled-movies/parts/footer.html themes/10up-block-theme/parts/footer.html
```
:::

## Templates, parts, and patterns: when to use what

| Concept | Lives in | Shared? | Use when |
| ------- | -------- | ------- | -------- |
| **Template** | `templates/` | N/A | Defining a full page layout |
| **Template part** | `parts/` | Yes, across templates | Reusable sections (header, footer) |
| **Pattern** | `patterns/` | Depends on usage | Starter content or template composition |

The key distinction: template parts always maintain a live link. When you edit a part, every template that references it gets the update.

Patterns have two modes. When an editor **inserts** a pattern into a post, the markup is copied and detached. But when a template **references** a pattern via `<!-- wp:pattern {"slug":"..."} /-->`, the pattern re-executes on every page load. We'll use patterns this way in [Lesson 9](./09-archive-templates-and-cards.md).

## Registering custom templates

When you need templates for custom post types, add them to the `customTemplates` array in `theme.json`. This is how the editor discovers them in the template picker:

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
        }
    ]
}
```

The `postTypes` array tells the editor which post types can use this template. Archive templates use an empty array because they match based on the template hierarchy (`archive-{post-type}.html`), not by assignment to individual posts.

We'll add these custom templates in [Lesson 4](./04-theme-json.md) when we configure `theme.json`.

## Files changed (fueled-movies delta)

| File | Change type | What changes |
| ---- | ----------- | ------------ |
| `parts/header.html` | Modified | Formatting, compact single-line block markup (whitespace only) |
| `parts/footer.html` | Modified | Replaced multi-column layout with copyright line + legal nav |
| `parts/site-header-navigation-area.html` | Modified | Added `align:"wide"` and `justifyContent:"left"` to navigation layout |

## Ship it checkpoint

- Navigation includes Movies and People links that resolve to `/movies/` and `/people/`
- Footer is simplified to a single copyright line with legal navigation
- Changes exist in `parts/*.html` files (exported from Site Editor)

TODO_SUGGEST_SCREENSHOT

## Takeaways

- The Site Editor is your visual IDE for building templates and parts. Author templates here, not by hand.
- After exporting changes to theme files, reset the template part in the Site Editor so it reads from the file again.
- Template parts maintain a live link across templates. Patterns can be either detached (inserted) or live (referenced via `<!-- wp:pattern -->`).
- Register custom templates in `theme.json` under `customTemplates` so the editor knows they exist.

## Further reading

- [Block Patterns](/reference/Patterns/overview)
- [Block Based Templates](/reference/Themes/block-based-templates)
- [Block Template Parts](/reference/Themes/block-template-parts)
