---
sidebar_label: 10. Building and Extending Blocks
sidebar_position: 10
---

# 10. Building and Extending Blocks

This lesson covers both building custom blocks from scratch and extending existing core blocks with new behavior. These are two sides of the same coin: when do you build new, and when do you extend what's already there?

## Learning Outcomes

1. Understand a custom block's anatomy: `block.json`, `index.js`, `markup.php`, `style.css`.
2. Know how to build parent/child block relationships using `parent` and `allowedBlocks`.
3. Be able to create a dynamic block that renders via PHP.
4. Know how to extend a core block with custom attributes and controls using block filters.
5. Know when to build a custom block vs extend a core one.

## Part A: Custom blocks

### The DL block family

The `fueled-movies` theme includes a four-block description list system for displaying movie and person metadata. It's a great example of parent/child block architecture with enforced nesting rules.

```
tenup/dl              ← Parent: the <dl> wrapper
└── tenup/dl-item     ← Child: a term+description pair
    ├── tenup/dt      ← Leaf: the <dt> term
    └── tenup/dd      ← Leaf: the <dd> description (can contain other blocks)
```

> 📐 **Diagram suggestion**: A tree diagram showing the nesting hierarchy with `parent` and `allowedBlocks` constraints labeled on each connection.

### Enforcing structure with parent and allowedBlocks

The nesting rules are defined in each block's `block.json`:

```json title="blocks/dl-item/block.json (partial)"
{
    "name": "tenup/dl-item",
    "title": "Description List Item",
    "parent": ["tenup/dl"]
}
```

```json title="blocks/dt/block.json (partial)"
{
    "name": "tenup/dt",
    "title": "Description List Term",
    "parent": ["tenup/dl-item"]
}
```

- **`parent`** restricts where a block can be inserted. `tenup/dl-item` can only exist inside `tenup/dl`. `tenup/dt` and `tenup/dd` can only exist inside `tenup/dl-item`.
- The DL block uses `InnerBlocks` to accept child blocks. The editor automatically filters the inserter to only show allowed children.

> 📷 **Screenshot suggestion**: The block inserter showing only `tenup/dl-item` as an option when inside a DL block.

### Dynamic rendering with markup.php

At 10up we build dynamic blocks — blocks that render on the server via PHP. The `markup.php` file is referenced as `render` in `block.json`:

```json title="blocks/dl/block.json (partial)"
{
    "name": "tenup/dl",
    "render": "file:./markup.php",
    "editorScript": "file:./index.js",
    "style": "file:./style.css"
}
```

The PHP render template receives three variables:

```php title="blocks/dl/markup.php"
<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (inner blocks).
 * @var WP_Block $block      Block instance.
 */

if ( empty( trim( $content ) ) ) {
    return;
}

$block_wrapper_attributes = get_block_wrapper_attributes();
?>

<dl <?php echo $block_wrapper_attributes; ?>>
    <?php echo $content; ?>
</dl>
```

- `$attributes` — the block's saved attributes (from `block.json`)
- `$content` — the rendered HTML of inner blocks (already processed by WordPress)
- `$block` — the full `WP_Block` instance, including context

`get_block_wrapper_attributes()` generates the correct wrapper attributes (classes, styles, IDs) based on block supports. Always use this instead of building class names manually.

:::tip
Dynamic blocks avoid deprecation headaches — the markup isn't saved to the database, so you can change it anytime without migration scripts. This is why 10up uses dynamic blocks as the standard.
:::

### Block context: movie-runtime

The `tenup/movie-runtime` block demonstrates reading data from the post via block context:

```json title="blocks/movie-runtime/block.json (partial)"
{
    "name": "tenup/movie-runtime",
    "usesContext": ["postId", "postType"],
    "render": "file:./markup.php"
}
```

```php title="blocks/movie-runtime/markup.php (simplified)"
$post_id = $block->context['postId'] ?? null;
if ( ! $post_id ) {
    return;
}

$runtime = get_post_meta( $post_id, 'tenup_movie_runtime', true );
$hours   = $runtime['hours'] ?? '0';
$minutes = $runtime['minutes'] ?? '0';

if ( '0' === $hours && '0' === $minutes ) {
    return;
}
?>

<time <?php echo get_block_wrapper_attributes( [
    'datetime' => esc_attr( 'PT' . $hours . 'H' . $minutes . 'M' ),
] ); ?>>
    <?php // renders "2h 28m" with ARIA labels ?>
</time>
```

The `usesContext` declaration in `block.json` tells WordPress to pass `postId` and `postType` from the query loop context. This lets the block read meta for whatever post it's rendering inside — without hardcoding a post ID.

### The editor component

The editor side uses `useBlockProps` and `useInnerBlocksProps` from `@wordpress/block-editor`:

```js title="blocks/dl/index.js"
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import { BlockEdit } from './edit';
import metadata from './block.json';

registerBlockType(metadata, {
    edit: BlockEdit,
    save: () => <InnerBlocks.Content />,
});
```

For dynamic blocks, the `save` function returns `<InnerBlocks.Content />` (if the block has inner blocks) or `null` (if it doesn't). The actual frontend markup comes from `markup.php`.

### Auto-registration

You don't need to manually register blocks. `src/Blocks.php` globs `dist/blocks/*/block.json` and calls `register_block_type_from_metadata()` for each:

```php title="src/Blocks.php (simplified)"
public function register_theme_blocks() {
    $block_json_files = glob( FUELED_MOVIES_THEME_BLOCK_DIST_DIR . '*/block.json' );

    foreach ( $block_json_files as $filename ) {
        $block_folder = dirname( $filename );
        register_block_type_from_metadata( $block_folder );
    }
}
```

Drop a folder with a `block.json` into `blocks/` and it's automatically available.

## Part B: Block extensions

### Extending core blocks

When you need to add behavior to an existing core block — a toggle, a class name, an extra control — you extend it instead of replacing it.

The `fueled-movies` theme extends the core Group block with a "separator" toggle using `registerBlockExtension` from `@10up/block-components`:

```js title="assets/js/block-filters/group.js"
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl, PanelBody } from '@wordpress/components';
import { registerBlockExtension } from '@10up/block-components';

registerBlockExtension('core/group', {
    extensionName: 'group-has-separator',
    attributes: {
        hasSeparator: {
            type: 'boolean',
            default: false,
        },
    },
    classNameGenerator: (attributes) => {
        const { hasSeparator, layout } = attributes;
        if (hasSeparator && layout?.type === 'flex' && layout?.orientation === 'horizontal') {
            return 'has-separator';
        }
        return '';
    },
    Edit: (props) => {
        const { attributes, setAttributes } = props;
        const { hasSeparator, layout } = attributes;

        // Only show for horizontal flex layouts
        if (layout?.type !== 'flex' || layout?.orientation !== 'horizontal') {
            return null;
        }

        return (
            <InspectorControls group="settings">
                <PanelBody title={__('Separator', 'tenup')}>
                    <ToggleControl
                        label={__('Add Separator', 'tenup')}
                        help={__('Creates a middot between each innerblock.', 'tenup')}
                        checked={hasSeparator}
                        onChange={(value) => setAttributes({ hasSeparator: value })}
                    />
                </PanelBody>
            </InspectorControls>
        );
    },
});
```

`registerBlockExtension` from `@10up/block-components` wraps the three WordPress block filters into a cleaner API:

1. **Add attribute** — `blocks.registerBlockType` adds the `hasSeparator` boolean
2. **Add editor control** — `editor.BlockEdit` renders the toggle in the inspector
3. **Add class output** — `blocks.getSaveContent.extraProps` adds the `has-separator` class

The corresponding CSS in `assets/css/blocks/core/group.css` handles the visual dot separator between items.

> 📷 **Screenshot suggestion**: The Group block's inspector panel showing the custom "Separator" toggle, and the visual result showing dots between inline items.

### When to build vs extend

| Situation | Approach |
|-----------|----------|
| Need entirely new markup and behavior | Build a custom block |
| Need to add a feature to an existing block | Extend with block filters |
| Need a dynamic display of post meta | Use block bindings (Lesson 9) first |
| Need structured nested content | Build parent/child blocks |

:::tip
Always try block bindings first. If a Paragraph with a binding can do the job, you don't need a custom block. Only build custom when core blocks genuinely can't handle the use case.
:::

## Tasks

### Part A: Custom blocks

1. **Read the DL block family.** Start with `blocks/dl/block.json`. Note the `supports` object. Then read `dl-item/block.json` — note `parent`. Follow through `dt` and `dd`.

2. **Read the PHP markup.** Open `blocks/dl/markup.php`. See how `get_block_wrapper_attributes()` generates the wrapper and `$content` renders inner blocks.

3. **Read the editor component.** Open `blocks/dl/index.js`. See how `useBlockProps` and `useInnerBlocksProps` wire up the editor.

4. **Create a new block.** Create a simple dynamic block in `blocks/` with a `block.json`, `index.js`, and `markup.php`. Use it in a template.

### Part B: Block extensions

5. **Read the Group filter.** Open `block-filters/group.js`. Identify the attribute definition, the conditional editor control, and the class name generation.

6. **Add a new extension.** Pick a core block (e.g. `core/heading`) and add a boolean toggle using `registerBlockExtension`. Make it add a visible class name and write CSS for it.

## Takeaways

- Custom blocks: `block.json` for metadata, `index.js` for the editor, `markup.php` for the frontend.
- Dynamic blocks (PHP-rendered) avoid deprecation problems — the 10up standard.
- Use `parent` and `allowedBlocks` to enforce nesting rules in parent/child block systems.
- `get_block_wrapper_attributes()` handles wrapper classes, styles, and IDs. Always use it.
- `usesContext` in `block.json` lets blocks read data from query loop context.
- Block extensions add features to core blocks using `registerBlockExtension` from `@10up/block-components`.
- Build custom when core blocks can't do the job. Extend when they almost can.

## Ship it checkpoint

- A custom block exists with `block.json` + editor + PHP render, used in a template
- A core block gains a new toggle/control that adds a class and visible styling

## Further reading

- [Custom Blocks](/reference/Blocks/custom-blocks)
- [Inner Blocks](/reference/Blocks/inner-blocks)
- [Block Extensions](/reference/Blocks/block-extensions)
- [Extending core blocks guide](/guides/extend-a-core-block)
