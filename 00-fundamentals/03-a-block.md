# Anatomy of a Block
## Block Canvas

## Toolbar

## Settings Sidebar

--- 

## States of a Block
### Initial Setup
The initial setup state is one that not all blocks will or even should have. But it is a common pattern that gets used whenever a block relies on a core piece of data before it can start displaying it's main interface. 

A great examples of this in the core blocks for example is the cover block. The cover relies on a background image or some background color. When neither of the two is selected there is not much you can do with the block. Therefore it presents you with a placeholder to select a background image or color and once you have completed this step you are not represented with all the options.

This pattern of having a placehoder also allows you to make it easier for your editors in very complex block to not overwhelm them when they start inserting the block. If you look at the core columns block the first thing you get to see is a placeholder where you can selecte the layout of columns you want to start with. You can of course change that easily later in the settings sidebar but you don't need to and can get up and running without having to interact with the advanced options in the sidebar at all. 

**This actually is a pattern that you will see over and over again throughout this section. The settings sidebar should be treated as optional. Most editors should never have to open it and interact with the options in it. Everythign they need to enter their content should be available inline.**

### Selected 
In it's selected state the editor representation should be though of as the frontend representation with additional inline controls to modify the content of the block. This means that if a block for example provides different rich text areas for you to fill out they should all be shown with placeholder text. This way editors can see all the options and choose to fill in all the areas they want to. 

Once they deselect the block all the fields they have not filled in will dissappear and the block becomes a true 1to1 representation of how it looks on the frontend. 

As an example for this you can take a look at the core image block. When the block is selected it shows you the placeholder for the image description. If you don't provide a description and deselect the block it will no longer show the placeholder. 

Another key piece of the selected experience for a block is that it's [[#Toolbar]] is shown. Editors can choose to either have the toolbar ancored to the top of the currently selected block or to the top of the editor canvas. _(The default is at the top of the block)_

The toolbar should provide the editor with any additional options that are commonly used. You can read more about the toolbar here: [[#Toolbar]]


### Selected Descendents
When a block has child blocks selected it should behave the same as in it's deselected state. The only difference is that there may be reasons for the parent block to provide additional options to a child blocks toolbar. You can see this pattern being used in the core columns block for example where the individual column blocks toolbar still allows you to change the vertical alignment of the overall columns block.

This is super usefull for any instanced where the child blocks are very tightly coupled with the parent block and you can hereby prevent the editors from constantly having to switch beteen the parent and child block. Use sparingly though since it can also easily become confussing. 

### Deselected 
As mentioned before the deselected state of a block should be a accurate representation of the frontend display. This includes font rendering, spacing within the block and in relationship to other blocks on the page. This should also be the case for the selected states but additional controls and placehodler elements may alter the spacing slightly. 
