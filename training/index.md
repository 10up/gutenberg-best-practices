---
sidebar_position: 0
sidebar_label: Introduction
---

# 10up Gutenberg Training

<iframe width="560" height="315" src="https://www.youtube.com/embed/UjaheV-jY00" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen></iframe>

## Overview

The purpose of this project is to help you build and customize (Gutenberg) blocks. This training applies to all engineering disciplines at 10up.

## Training Prerequisites

* Basic understanding of WordPress including how themes are structured.
* Understanding of JavaScript fundamentals and ES6+ concepts.
* Basic understanding of React components.

For resources on learning JavaScript and React.js, look through this [internal document](https://internal.10up.com/docs/javascript-tutorials/).

## Project Setup

For this training we recommend the usage of [10up-docker](https://github.com/10up/wp-local-docker-v2) for the local environment. To get everything setup on your computer follow these steps here:

1. Create a local WordPress installation with the domain `gutenberg-training.test`

```bash
10updocker create gutenberg-training
```

2. Clone this repository into the `wordpress` directory replacing the `wp-content` folder

```bash
cd gutenberg-training-test/wordpress && rm -rf wp-content && git clone git@gitlab.10up.com:exercises/gutenberg-lessons.git wp-content
```

3. Navigate to the theme directory and install dependencies

```bash
cd wp-content/themes/10up-theme && npm install && npm run start
```

4. Activate the 10up-theme in WordPress

```bash
10updocker wp theme activate 10up-theme
```

5. Start watching for file changes that you will make

```bash
npm run watch
```

:::caution
The `10up-theme` build system requires node version **14** in order to build successfully. If you have [`nvm`](https://github.com/nvm-sh/nvm) installed it should auto detect the which version to use.
:::caution

## Lessons

* [Lesson 1: Anatomy of a block](./01-overview.md)
* [Lesson 2: A Simple CTA block](./02-cta-lesson.md)
* [Lesson 3: Block Styles](./03-styles.md)
* [Lesson 4: Block Variations](./04-variations.md)
* [Lesson 5: Inner Blocks / Block Nesting](./05-inner-blocks.md)
* [Lesson 6: Rich Text Formats](./06-rich-text-formats.md)
* [Lesson 7: Slot Fill](./07-slot-fill.md)
* [Lesson 8: Build your own](./08-build-your-own.md)

## Support

If you run into issues with this training project, feel free to reach out in Slack to [`#10up-gutenberg`](https://10up.slack.com/archives/C8Z3WMN1K). We also welcome bug reports, suggestions and contributions via the [Issues tab in Gitlab](https://gitlab.10up.com/exercises/gutenberg-lessons/-/issues).
