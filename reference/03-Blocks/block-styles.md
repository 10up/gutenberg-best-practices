---
sidebar_position: 2
---

# Block Styles

Block styles are a relatively simple API that allows you to add different visual styles to a block. In Core the image for example allows you to select a rounded style to round the corners of the image. 

This API comes with many cravats though and should be used very sparingly. Instead [block extensions](block-extensions) should be used in most cases because of the increased flexibility.  

## User Experience
In the editor styles are the first thing a user sees in the blocks setting sidebar. They are shown very prominently. So initially it seems like a great spot to place to put controls. This is only true as long as there are no more than 4 styles present. After that point the experience becomes too cluttered and overwhelming.

Additionally the style options have one fatal flaw. Only one of them can be active at a time. And most things that end up becoming styles are things that you down the line would love to combine. And that is a downfall that happens very quickly. At the beginning of a project 2-4 styles get added to a block. And after using it for a moment the client comes back now wanting to combine the options from Style A and Style B. And at that point you would need to create a separate new style for the combination of A & B. And then someone else wants to use B & C and so on. Styles lead you into a corner very quickly. 

One more issue is that styles are actually little iframes with a full block editor rendered inside to render an alternate version of the block. Which is very nice visually. But when you have more than 4 block styles it can quickly get lead to an unresponsive editor that takes a long time to load. 

## Developer Experience
The DX of block styles initially is very simple. You can register a block style both in JS and in PHP with just one simple function call. The `register_block_style` / `registerBlockStyle` function allows you to register a new style to any block.

Once the style is registered it automatically adds a class name to the wrapping element of the block following the convention `is-style-${style-name}`. 

There is no actual API for checking which style is currently selected though and there is no listener to subscribe to changes in the selected style. 

## Alternative
Most use-cases of Block Styles would be better suited as [block extensions](block-extensions). 