---
sidebar_position: 3
sidebar_label: Block Based Themes
description: Introduction to the Block-Based Themes training course.
keywords: [gutenberg, wordpress block editor, training, course, fse, full site editing, block-based-themes, theme.json]
---

# 10up Block Based Themes Training

## Overview

This training course will walk you through the building of a block-based WordPress theme. By the end, you'll have transformed [the 10up Block Theme](https://github.com/10up/wp-scaffold/tree/trunk/themes/10up-block-theme) into a fully functional movie database theme, complete with custom post types, block bindings, editor controls, and interactive blocks.

If you're new to blocks entirely, we recommend starting with our [Building Blocks](/training/Blocks/) training course first.

## Prerequisites

- [Node.js](https://nodejs.org/) (>=20.0.0) and npm (>=9.0.0)
- PHP (>=8.3)
- [Composer](https://getcomposer.org/)
- MySQL (8+)
- Git
- A code editor
- Basic familiarity with the command line

## Getting started

### 1. Create a LocalWP site

You can certainly do this course using your development environment of choice, but we recommend [LocalWP](https://localwp.com/) and have outlined the steps necessary to get started with it below.

<dl>
<dt>Create a site</dt>
<dd>Create a new site</dd>
<dt>What's your site's name?</dt>
<dd><code>Block Based Theme Training</code><br/>Advanced options > Local site domain: <code>block-based-theme-training.local</code></dd>
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

:::info
Going forward, please work from the `wp-content` folder when executing commands such as `npm run build`. The course will later provide additional instructions under the assumption your terminal is in that directory.
:::

### 3. Configure wp-config.php

Add the following constants to your `wp-config.php`:

```php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'SCRIPT_DEBUG', true );
define( 'WP_DEVELOPMENT_MODE', 'all' );
```

### 4. Activate the theme

Log in to `wp-admin`, go to **Appearance > Themes**, and activate the **10up Block Theme**.

At any time, you may also activate the **Fueled Movies** theme to see the finished product of this training course.

## Content Import

Once your site is set up, import the sample movie and person content.  Open the **Site Shell** from the LocalWP dashboard for your site and run the following.  The default import will add 30 movies and a approximately 90 persons.  Alternatively, you can choose to import only your favorite films and their stars using the id found in the URL of an IMDB entry (e.g. - `tt0094721`).

```bash
# Recommended default, imports 30 movies and 3 members of their cast.
wp fueled-movies import

# Import only your favorite movies and their stars via the IMDB ID as found in their URL.
# e.g. https://www.imdb.com/title/tt0094721
# These should be movie ID's (not TV shows) as a comma seperated list.
wp fueled-movies import --ids=tt0094721,tt0910970,tt0068646

# Preview without creating posts
wp fueled-movies import --dry-run

# Override default star limit (default: 3 per movie)
wp fueled-movies import --ids=tt0094721 --star-limit=5
```

## What you should see

Visit the frontend at [block-based-theme-training.local](http://block-based-theme-training.local), you should see the following.

![The 10up Block Theme added to a new LocalWP site](../../static//img/training/10up-block-theme-initial-screenshot.png)

To ensure our content has imported, visit [block-based-theme-training.local/movies](http://block-based-theme-training.local/movies) and [block-based-theme-training.local/people](http://block-based-theme-training.local/people).

![The Movies archive page](../../static//img/training/10up-block-theme-initial-movies-screenshot.png)
![The People archive page](../../static//img/training/10up-block-theme-initial-people-screenshot.png)

## Lessons

1. [Anatomy of a Block Based Theme](./01-overview.md)
2. [Orientation: The 10up Block Theme](./02-using-10up-block-theme.md)
3. [The Site Editor](./03-site-editor.md)
4. [theme.json: Design Tokens and Settings](./04-theme-json.md)
5. [Styles: CSS Architecture and Style Variations](./05-styles.md)
6. [Render Filters and Block Styles](./06-render-filters-and-block-styles.md)
7. [Understanding the Content Model](./07-content-model.md)
8. [Editor Controls for Post Meta](./08-editor-controls.md)
9. [Archive Templates and the Card Pattern](./09-archive-templates-and-cards.md)
10. [Block Bindings and Single Templates](./10-block-bindings.md)
11. [Block Extensions: Extending Core Blocks](./11-block-extensions.md)
12. [Custom Blocks: Description Lists and Movie Runtime](./12-custom-blocks.md)
13. [Interactivity API: Rate a Movie](./13-interactivity-api.md)

## Support

If you run into issues with this training project, feel free to reach out in Slack to [`#10up-gutenberg`](https://10up.slack.com/archives/C8Z3WMN1K). We also welcome bug reports, suggestions and contributions via the [Issues & Discussions tab on GitHub](https://github.com/10up/gutenberg-best-practices/issues).
