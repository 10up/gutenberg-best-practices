---
sidebar_label: Add Meta Information to Query Loop
---

# Add Meta Information to Query Loop

The query loop in Gutenberg allows us to pull posts based on specific parameters. But it comes with a rather limited set of data that it can show. For most custom projects, we want to add *more* information like: author name, author profile image, content length in minutes and more.

![How the query selector "initial" view looks like](../static/img/query-selector-initial.png)

Let's imagine we build a "Writers" site where authors can publish their short fiction. We want to showcase how long each work is in words, a common way to measure. So, we will create a new "Micro block" that will output only the words count of a blog post inside the query loop.

We will allow the **editor** to add it in the block editor. This is important note - we allow the editorial team of the site to pick which **meta** information is shown in a given query loop block. Just like they can add regular paragraphs or images in a column, they can add custom meta to query loops. 

### Action plan:

1. Create a new block for the meta information we want to showcase (How long is the article in words)
2. Allow the users to add it to the query loop
3. Test if each article showcases it's own length
4. Make sure the new block doesn't work outside of the query loop.

## Create the new block

We want to create a "micro component". A very small component that will output just the information we want. In our case, this is the length of the post in words. If we put aside the regular files/code we need to add for each component like block.json, index.js, edit.js etc, we can focus just on the important part:

 * How to know which post we are working with?
 * How to get the data we want
 * How to add it to the query loop.

First - **get the ID** of the post we need to get data from. This happens by telling WordPress about what "context" we need. Let's add this in the `block.json` file:

```
"usesContext": ["postId"],
```

Here, we get the postId provided by the block parent. If our block is added straight into a post, then we get that post's ID. If the block is added in the query loop, then for each post in the query loop, we get it's ID. Just what we needed!

Second - **How do we get the data?** Let's create our block and look at it's parts:

```jsx
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { count as wordCount } from '@wordpress/wordcount';

const PostLength = ({ context: { postId } }) => {
	const postData = useSelect((select) => {
		return select('core').getEntityRecord('postType', 'post', postId);
	}, []);

	return (
		<span>
			{__('Words:')} {wordCount(postData.content.raw)}
		</span>
	);
};
export default PostLength;
```

In the props, you can see that we will receive context in which we will find the postID. The same postID we requested in the block.json file. Next, we want some more information, not just the ID. `getEntityRecord()` will give us just that. With useSelect, we will grab a post by it's ID and return the result inside `postData`.

The final step would be to apply the functionality of our component and count the words. For this we will use the build-in function from WordPress wordCount and pass in the content of the post.

![The block inserted in the editor](../static/img/block-words-count.png)