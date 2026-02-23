---
sidebar_position: 3
sidebar_label: Block Based Themes
description: Introduction to the Block-Based Themes training course.
keywords: [gutenberg, wordpress block editor, training, course, fse, full site editing, block-based-themes, theme.json]
---

# 10up Block Based Themes Training

:::info
This training course is currently in progress. Check back soon for updates.
:::

## Overview

This training course walks you through building and customizing a block-based WordPress theme. By the end, you'll have transformed the 10up Block Theme scaffold into a fully functional movie database theme — complete with custom post types, block bindings, editor controls, and interactive blocks.

If you're new to blocks entirely, we recommend starting with our [Building Blocks](/training/Blocks/) training course first.

## Who this is for

WordPress developers — junior through senior — who are comfortable with PHP, JavaScript, and the WordPress ecosystem but may be new to the block editor and Full Site Editing. You should know your way around a theme's `functions.php` and have used hooks before, but you don't need to have built a block or touched `theme.json`.

## Prerequisites

- [Node.js](https://nodejs.org/) (>=20.0.0) and NPM (>=9.0.0)
- Git
- [LocalWP](https://localwp.com/)
- A code editor
- Basic familiarity with the command line

## Getting started

### 1. Create a Local site

<dl>
<dt>Create a site</dt>
<dd>Create a new site</dd>
<dt>What's your site's name?</dt>
<dd><code>block-based-theme-training</code><br/>Advanced options > Local site domain: <code>block-based-theme-training.local</code></dd>
<dt>Choose your environment</dt>
<dd>Custom<br/>PHP version: <code>8.3.x</code><br/>Web server: <code>nginx</code><br/>Database: <code>MYSQL 8+</code></dd>
<dt>Set up WordPress</dt>
<dd>Username: <code>admin</code><br/>Password: <code>password</code><br/>Email: <code>example@example.com</code><br/>Is this a WordPress Multisite? <code>No</code></dd>
</dl>

### 2. Clone the repository

https://github.com/10up/block-based-theme-training

Open your terminal and navigate to `~/Local Sites/block-based-theme-training/app/public`, or from the LocalWP dashboard screen for the site select **Site shell**.

```bash
rm -rf wp-content

git clone git@github.com:10up/block-based-theme-training.git wp-content

cd wp-content

nvm use && npm install && npm run build && composer install

cd mu-plugins/10up-plugin && composer install

cd ../..

cd themes/10up-block-theme && composer install

cd ../..
```

### 3. Configure wp-config.php

Add the following constants to your `wp-config.php`:

```php
define( 'SCRIPT_DEBUG', true );
define( 'WP_DEVELOPMENT_MODE', 'all' );
define( 'WP_ENVIRONMENT_TYPE', 'local' );
```

### 4. Activate the theme

Log in to `wp-admin`, go to **Appearance > Themes**, and activate the **10up Block Theme**.

## Lessons

1. [Anatomy of a Block Based Theme](./01-overview.md)
2. [Using the 10up Block Theme](./02-10up-block-theme.md)
3. [Templates, Template Parts, and the Site Editor](./03-templates-and-parts.md)
4. [theme.json — Design Tokens and Settings](./04-theme-json.md)
5. [Styles — CSS Architecture and Style Variations](./05-styles.md)
6. [Patterns as a Composition Tool](./06-patterns.md)
7. [Content Model — CPTs, Taxonomies, and Post Meta](./07-content-model.md)
8. [Editor Controls for Post Meta](./08-editor-controls.md)
9. [Block Bindings API](./09-block-bindings.md)
10. [Building and Extending Blocks](./10-blocks-and-extensions.md)
11. [Interactivity API — Rate a Movie](./11-interactivity-api.md)

## Support

If you run into issues with this training project, feel free to reach out in Slack to [`#10up-gutenberg`](https://10up.slack.com/archives/C8Z3WMN1K). We also welcome bug reports, suggestions and contributions via the [Issues & Discussions tab on GitHub](https://github.com/10up/gutenberg-best-practices/issues).
