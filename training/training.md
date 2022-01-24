---
sidebar_position: 0
sidebar_label: Introduction
---

# 10up Gutenberg Training

<iframe width="560" height="315" src="https://www.youtube.com/embed/UjaheV-jY00" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

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
* [Lesson 1: Anatomy of a block](overview)
* [Lesson 2: A Simple CTA block](cta-lesson)
* [Lesson 3: Block Styles](styles)
* [Lesson 4: Block Variations](variations)
* [Lesson 5: Inner Blocks / Block Nesting](inner-blocks)
* [Lesson 6: Rich Text Formats](rich-text-formats)
* [Lesson 7: Slot Fill](slot-fill)

## Build Your Own

After going through the lessons, it's time to put all your newly learned skills together and build a block by yourself. Spend no more than ~4 hours on this block. Submit what you build to your Director of Engineering for review.

### What to Build

Your task is to build a block called "Author Byline". The block should show the author of the current post next to their avatar image. There should be a block setting for hiding the avatar image.

To start you should make a clone of the [10up WP Scaffold](https://github.com/10up/wp-scaffold). The block should be created as a part of the theme.

### Technical Specifications

* Built as a dynamic block
* Following 10up Best Practices
* Follows block building patterns shown in the [10up WP Scaffold example block](https://github.com/10up/wp-scaffold/tree/trunk/themes/10up-theme/includes/blocks/example-block).

If you get stuck or have questions, please post in the [`#10up-gutenberg`](https://10up.slack.com/archives/C8Z3WMN1K) Slack channel.


## Support
If you run into issues with this training project, feel free to reach out in Slack to [`#10up-gutenberg`](https://10up.slack.com/archives/C8Z3WMN1K). We also welcome bug reports, suggestions and contributions via the [Issues tab in Gitlab](https://gitlab.10up.com/exercises/gutenberg-lessons/-/issues).
