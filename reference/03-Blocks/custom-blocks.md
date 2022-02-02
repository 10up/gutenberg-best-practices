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
