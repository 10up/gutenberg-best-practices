# Lesson 10: Scaffolding with the Block Scaffold Command

## Overview

This lesson will guide you through using the `scaffold:block` command available in the [10up WP Scaffold](https://github.com/10up/wp-scaffold) setup. The command provides a structured way to generate Gutenberg blocks inside a theme or plugin without requiring manual setup.

By the end of this lesson, you will:

- Understand how `scaffold:block` works.
- Learn how to use the command to create a new block inside your project.
- Explore the generated file structure.
- See how the command can be extended for custom block variants.

## Understanding the Command

Inside the wp-scaffold repository, the `scaffold:block` command is pre-configured in the `package.json` file of your theme or plugin:

```
"scripts": {
  "scaffold:block": "cd includes/blocks/ && wp-create-block --no-plugin --template ../../../../bin/create-block-template"
}
```

### What Does This Command Do?

1. **Changes directory** (`cd`) into the `includes/blocks/` folder inside the theme/plugin.
2. **Runs** `wp-create-block`, the official WordPress CLI command for generating blocks.
3. **Uses a custom template** (`bin/create-block-template`) to ensure blocks follow project conventions.

This command ensures all blocks are created in the correct directory and follow a consistent structure.

## Running the Command

To create a new block, follow these steps:

1. **Navigate to your theme/plugin directory:**

```
cd path/to/your-theme-or-plugin
```

2. **Run the scaffold command:**

```
npm run scaffold:block
```
3. **Follow the prompts** in the terminal:

```
Let's add a new block to your existing WordPress plugin:
? The template variant to use for this block: default
? The block slug used for identification (also the output folder name): my-custom-block
? The internal namespace for the block name (something unique for your products): tenup
? The display title for your block: My Custom Block
? The short description for your block (optional): A custom block
? The dashicon to make it easier to identify your block (optional): block
? The category name to help users browse and discover your block: text
```

:::tip
If you prefer **not** to switch directories every time you scaffold a block inside your theme or plugin, you can run the command from the project root using the **workspace flag (`-w`)**:. This will execute the scaffold command inside the **specified workspace** (theme or plugin)
without requiring you to manually `cd` into the directory. 🚀.

For example:
```
npm run scaffold:block -w tenup-theme
npm run scaffold:block -w tenup-plugin
```
:::

### Explanation of Prompts

| Prompt                 | Description                                          | Example Input     |
| ---------------------- | ---------------------------------------------------- | ----------------- |
| **Template variant**   | Selects a predefined template (default is provided). | `default`         |
| **Block slug**         | Defines the folder name and block ID.                | `my-custom-block` |
| **Internal namespace** | Unique namespace to avoid conflicts.                 | `tenup`           |
| **Display title**      | The title shown in the editor.                       | `My Custom Block` |
| **Short description**  | Optional description of the block.                   | `A custom block`  |
| **Dashicon**           | Icon used to identify the block in the editor.       | `block`           |
| **Category name**      | Determines where the block appears in the editor.    | `text`            |

## Understanding the Scaffolded Files

After completing the prompts, the command generates the following structure inside `includes/blocks/my-custom-block/`:

:::warning
The exact files may vary depending on the type of block you scaffold.
:::

### Standard Block Structure
For a basic block, the following files are created:

```
includes/blocks/my-custom-block/
├── block.json
├── index.js
├── edit.js
├── markup.php
├── style.css
```

### Key Files:
- `block.json` – Defines block metadata (title, attributes, category).
- `index.js` – Registers the block in WordPress.
- `edit.js` – Defines the editor-side behavior of the block.
- `markup.php` - PHP template for rendering the block on the frontend.
- `style.css` – Styles for frontend and editor.

## Customizing the Scaffold

The scaffold system allows you to:
1. **Modify existing block variants** by changing settings inside `bin/create-block-template/index.js`.
2. **Add new block variants** to introduce different block configurations, such as an **interactive block**.

### Modifying Existing Block Variants

To customize the default behavior of scaffolded blocks, you can modify `bin/create-block-template/index.js`. This file contains **default values** for newly created blocks and allows you to change attributes, support settings, metadata, and more.

For example, to add a new default attribute for all block variants, simply add the new attribute to the `attributes` object, e.g.

```
attributes: {
  title: {
    type: string,
    default: ''
  }
}
```

After making your changes, save the file. Future blocks scaffolded using `npm run scaffold:block` will now reflect these modifications.

### Adding a New Block Variant
Instead of modifying existing blocks, you can **add new block types** (variants) inside `bin/create-block-template/index.js`. Variants allow you to introduce different configurations, such as an **interactive block**.

:::info
The `index.js` file inside `bin/create-block-template/` contains all the information for dynamically building the **`block.json` file for the scaffolded blocks.** It defines the **default settings** and **variants** that determine the files, attributes, and dependencies a block includes.
:::

#### **Step 1: Define the variant**
To add an interactive variant, open the `bin/create-block-template/index.js` and add the `interactive` variant inside the `variants` object:

```
variants: {
	...other variants,
	interactive: {
		viewScriptModule: 'file:./view-module.js',
		supports: {
			html: false,
			interactivity: {
				interactive: true,
				clientNavigation: true,
			},
		},
	},
},
```
#### **Step 2: Update the Mustache Templates**
The scaffolding system uses *Mustache* templates in `bin/create-block-template/block-templates/` to generate the block's code dynamically. To integrate the interactive variant, update the relevant files.

Inside `bin/create-block-template/block-templates/`, create a new `view-module.js.mustache` file and paste the following code:

```
{{#isInteractiveVariant}}
import { store, getContext, getElement } from '@wordpress/interactivity';

store(
	'{{namespace}}/{{slug}}',
	{
		state: {},
		context: {},
		actions: {},
		callbacks: {},
	}
);
{{/isInteractiveVariant}}
```

This ensures the `view-module.js` file is only generated **if the user selects the interactive variant.**

**Next**, open `markup.php.mustache` inside `bin/create-block-template/block-templates/`, and add the following code to include conditional attributes for interactive blocks:

```
$additional_attributes = [
	{{#isInteractiveVariant}}
	'data-wp-interactive' => '{{namespace}}/{{slug}}',
	'data-wp-context'     => wp_json_encode(
		[],
		JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
	),
	{{/isInteractiveVariant}}
];
```

This ensures that when an **interactive block is selected**, the `data-wp-interactive` and `data-wp-context` attributes are added dynamically in the generated markup.php file.

#### **Step 3: Generate an Interactive Block**
Once the changes are made, scaffold a new block:

```
npm run scaffold:block
```

Follow the prompts and choose the **"interactive"** variant when asked for the template.

## Conclusion
The `scaffold:block` command simplifies Gutenberg block creation with an interactive process. It ensures consistency, reduces manual setup time, and allows customization through the template system.

## Next Steps
- **Try running** `npm run scaffold:block` and create a test block.
- **Explore** the generated files to understand their role.
- **Modify** `bin/create-block-template/` to introduce custom block variants.
