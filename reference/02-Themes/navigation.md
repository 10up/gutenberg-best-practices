---
sidebar_label: Navigation
sidebar_position: 6
---

# Navigation in Block-based Themes

Block-based themes changed how navigation areas are built. Instead of using `wp_nav_menu()` in your theme, you now use blocks to create navigation areas. Each navigation menu now has a post in a hidden core post type called `wp_navigation`. These posts then contain the block markup for the navigation menu.

## Working with Navigation Menus

The core navigation block stores the ID of the navigation post in its attributes. This way the block knows which navigation menu to display.

Sadly, because of this reliance on the ID we lose the concept of navigation areas. In classic themes you could register a navigation area and then assign a menu to it in the Customizer. This is not possible anymore with block-based themes.

That means we have to become a little creative when it comes to working with the ID's of navigation menus when working across multiple environments.

There are two main problems we have to solve for:

  1. The ID of the navigation menu changes when moving the site from one environment to another.
  2. Selecting the Navigation Menu to use in the site editor will mean that the template / template-part will now be saved to the database and is locked out of code updates.

We have a few options of working around these limitations:

### 1. Sync the navigation menus across all environments

Create all the navigation menus on your production site and then export them to your development environment. This way the ID's will stay the same across all environments.
Whilst this approach is the easiest to implement, it is not the most flexible. If you ever need to change the navigation menu on your development environment, you will have to export it again and import it on your production site.

### 2. Wrap the navigation block alone in a separate block based template part

Doing this allows you to keep the settings of the navigation block separate from the rest of the template. This way you can change the navigation menu in the site editor without having to worry about the rest of the template being saved to the database. You still don't have the same navigation menu across all environments, but at least you can change it without having to export and import it.

### 3. Custom Navigation Block

Something we have also done, is creating a custom navigation block that uses the same underlying logic of the core navigation post type etc. But instead of storing the ID of the navigation post in the block attributes, we store the slug of the navigation menu. This way we can easily change the navigation menu in the site editor without having to worry about the ID changing.

### 4. Custom Navigation Block that uses the old menu system

Another option is to create a custom navigation block that uses the old menu system. This way you can still use the old menu editor to assign a menu to a navigation area. This approach does retain the familiarity of the old system, but it also means you are not using the new block-based system to its full potential.

## Navigation Overlays (WordPress 7.0)

WordPress 7.0 introduces fully customizable **navigation overlays** for the mobile hamburger menu. The overlay is now driven by a regular block pattern that you can edit directly in the Site Editor, and the new `core/navigation-overlay-close` block exposes a styleable close affordance.

Highlights:

- Overlays are editable in-place and previewable from the Navigation block toolbar.
- Themes can ship a **default overlay template** that the editor uses as the starting point whenever the overlay is opened for the first time.
- The four overlay patterns bundled with core (centered, accent, dark, plain) can be unregistered or replaced with theme-specific ones.

When building a custom 10up theme:

1. Register an overlay pattern with the `header` category and the `core/navigation-overlay` template area so it's available in the overlay picker.
2. Include `core/navigation-overlay-close` inside the pattern and style it via `theme.json` to match the rest of the design system.
3. For client builds where editors should not switch overlays, lock the Navigation block's overlay attribute through the `block_editor_settings_all` filter.
