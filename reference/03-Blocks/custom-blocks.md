---
sidebar_position: 5
---

# Custom Blocks

WordPress itself comes with a whole bunch of build in _"core"_ blocks. These blocks are build to be flexible, and are meant to allow you to build any layout you want.

However these goals the core blocks have may not always align with the goals you have for the client you are building a site for. Or there may be integrations that straight up are not possible.

This is where the block editor allows you to build your own custom blocks.

## When to build custom blocks

This really depends on the project you are working on. You can find an entire deep dive on [how to decide what to build](/guides/choose-your-adventure). In short, custom blocks allow you to cater the user experience ot the clients needs.

In short custom blocks are the solution if you either need to add special functionality that isn't already covered by core blocks and also when the editorial user experience should be more tailored to the specific needs of the client.

:::info
At the end the editorial experience is key. Some clients essentially want a page builder to be able to build _any_ design they want. Others may not want to think about having to design at all.
:::

## User experience of custom blocks

When it comes to the user experience of the custom blocks you are building the most important goal is to aim for direct inline manipulation of the content. This means allowing your users to visually see how their content is going to look to the end user without having to leave the editor.

The goal should be for any custom block to behave in a similar fashion to core blocks. Using the block should feel native to the editor.

For the placement of controls, and the various states of the block, it should follow the guidance in the [anatomy of a block](./../01-Fundamentals/a-block.md) article.

## How to build custom blocks

At 10up the majority of custom blocks we develop blocks as [dynamic blocks](./dynamic-blocks.md). That means that the markup gets generated on the server in PHP when a site is loaded instead of stored in the database. We also often bundle blocks as part of a theme instead of in their own plugin. The reason for this is that most of the blocks are very tied to the custom design and functionality ot the site. Even if the blocks were to live within a plugin, switching the theme would have detrimental effects to how the blocks look and work and therefore the additional overhead of maintaining separate plugins oftentimes is not worth it.

:::info
These best practices only apply to closely monitored custom client builds. Blocks for open source projects should use static rendering as the default and should ship in plugins only.

In general. If a block provides functionality it is better suited in a plugin. If it is a design / layout element specific to a theme it should be bundled with the theme.
:::info
