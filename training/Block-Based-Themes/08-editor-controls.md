---
sidebar_label: 8. Editor Controls for Post Meta
sidebar_position: 8
---

# 8. Editor Controls for Post Meta

In the [previous lesson](./07-content-model.md) we explored how meta fields are defined in the MU plugin. Now we need to build the editor UI so content editors can actually fill them in. WordPress no longer needs custom metaboxes, the block editor's SlotFill system lets us inject panels directly into the document sidebar.

## Learning Outcomes

1. Know how to build editor UI for meta fields using `PluginDocumentSettingPanel`.
2. Be able to add a control that reads and writes post meta via `useEntityProp`.
3. Understand how to scope a sidebar panel to a specific post type.

## Architecture

The `fueled-movies` theme registers two sidebar panels — one for Movie fields, one for Person fields — using WordPress's plugin registration system. Each panel renders reusable components from `assets/js/block-components/PostMeta/`.

```
assets/js/
├── block-plugins/
│   ├── index.js                    ← aggregator
│   ├── movie-meta-fields.js        ← Movie sidebar panel
│   └── person-meta-fields.js       ← Person sidebar panel
├── block-components/
│   └── PostMeta/
│       ├── MovieIMDBID.js           ← IMDB ID text field
│       ├── MovieMPARating.js        ← MPA Rating dropdown
│       ├── MoviePlot.js             ← Plot textarea
│       ├── MovieReleaseYear.js      ← Release year
│       ├── MovieRuntime.js          ← Runtime hours/minutes
│       ├── MovieViewerRating.js     ← Viewer rating display
│       ├── MovieViewerRatingCount.js
│       ├── MovieTrailerID.js        ← IMDB Trailer ID
│       ├── PersonBiography.js       ← Biography textarea
│       ├── PersonBirthplace.js      ← Birthplace text field
│       ├── PersonBorn.js            ← Birth date picker
│       ├── PersonDeathplace.js
│       ├── PersonDied.js            ← Death date picker
│       └── PersonIMDBID.js
```

These files are loaded via `block-extensions.js` (the editor-only entry point), which imports `./block-plugins`.

## The sidebar panel

Here's the complete Movie sidebar panel:

```js title="assets/js/block-plugins/movie-meta-fields.js"
import { Flex } from '@wordpress/components';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { usePost } from '@10up/block-components';

import MovieIMDBID from '../block-components/PostMeta/MovieIMDBID';
import MoviePlot from '../block-components/PostMeta/MoviePlot';
import MovieMPARating from '../block-components/PostMeta/MovieMPARating';
import MovieReleaseYear from '../block-components/PostMeta/MovieReleaseYear';
import MovieRuntime from '../block-components/PostMeta/MovieRuntime';
import MovieViewerRating from '../block-components/PostMeta/MovieViewerRating';
import MovieViewerRatingCount from '../block-components/PostMeta/MovieViewerRatingCount';
import MovieTrailerID from '../block-components/PostMeta/MovieTrailerID';

const MovieFields = () => {
    const { postType } = usePost();

    if (postType !== 'tenup-movie') {
        return null;
    }

    return (
        <PluginDocumentSettingPanel
            name="tenup-movie-fields"
            title={__('Movie Information', 'tenup')}
        >
            <Flex direction="column">
                <MovieIMDBID />
                <MovieTrailerID />
                <MovieReleaseYear />
                <MovieMPARating />
                <MovieRuntime />
                <MovieViewerRating />
                <MovieViewerRatingCount />
                <MoviePlot />
            </Flex>
        </PluginDocumentSettingPanel>
    );
};

registerPlugin('tenup-movie-fields', {
    render: MovieFields,
});
```

Key patterns:

1. **Post type scoping** — `usePost()` from `@10up/block-components` gives us the current post type. Return `null` if it doesn't match — the panel simply won't render.
2. **`PluginDocumentSettingPanel`** — This is the SlotFill that injects a panel into the document sidebar. The `name` must be unique, and `title` is displayed as the panel header.
3. **`registerPlugin`** — Registers the component as a plugin with the block editor. This is how WordPress knows to render it.
4. **One component per field** — Each meta field has its own component, keeping things modular and testable.

> 📷 **Screenshot suggestion**: The document sidebar in the editor for a Movie post, showing the "Movie Information" panel with fields for IMDB ID, YouTube ID, Release Year, MPA Rating, Runtime, etc.

## Meta field components

Each component follows a consistent pattern using `PostMeta` from `@10up/block-components`. Here's the MPA Rating dropdown:

```js title="assets/js/block-components/PostMeta/MovieMPARating.js"
import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import { PostMeta } from '@10up/block-components';

const MovieMPARating = ({ postMetaProps, ...restProps }) => {
    const options = Object.entries(TenupMovieMPARating.options).map(([key, value]) => ({
        label: value,
        value: key,
    }));

    return (
        <PostMeta metaKey="tenup_movie_mpa_rating" {...postMetaProps}>
            {(meta, setMeta) => (
                <SelectControl
                    label={__('MPA Rating', 'tenup')}
                    value={meta}
                    options={options}
                    onChange={(value) => setMeta(value)}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    {...restProps}
                />
            )}
        </PostMeta>
    );
};
```

The `PostMeta` component from `@10up/block-components` wraps `useEntityProp` and provides the current meta value and a setter function as render props. If you're not using `@10up/block-components`, the equivalent vanilla pattern is:

```js
import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

const MyMetaField = () => {
    const postType = useSelect((select) => select('core/editor').getCurrentPostType());
    const [meta, setMeta] = useEntityProp('postType', postType, 'meta');
    const value = meta?.tenup_movie_tagline ?? '';
    const onChange = (newValue) => setMeta({ ...meta, tenup_movie_tagline: newValue });

    return (
        <TextControl
            label="Tagline"
            value={value}
            onChange={onChange}
        />
    );
};
```

:::tip
The pattern for reading/writing post meta in the editor:

```js
const [meta, setMeta] = useEntityProp('postType', postType, 'meta');
const value = meta?.your_meta_key ?? '';
const onChange = (newValue) => setMeta({ ...meta, your_meta_key: newValue });
```
:::

### Complex meta: MovieRuntime

The runtime field demonstrates a more complex component — it stores an object with `hours` and `minutes` properties:

```js title="assets/js/block-components/PostMeta/MovieRuntime.js"
import { __ } from '@wordpress/i18n';
import { BaseControl, TimePicker } from '@wordpress/components';
import { PostMeta } from '@10up/block-components';

const MovieRuntime = ({ postMetaProps, ...restProps }) => {
    return (
        <PostMeta metaKey="tenup_movie_runtime" {...postMetaProps}>
            {(meta, setMeta) => (
                <BaseControl
                    id="tenup-movie-runtime"
                    label={__('Runtime', 'tenup')}
                    help={__('In hours & minutes', 'tenup')}
                >
                    <TimePicker.TimeInput
                        onChange={(value) => {
                            setMeta({
                                hours: String(value.hours),
                                minutes: String(value.minutes),
                            });
                        }}
                        value={meta}
                        {...restProps}
                    />
                </BaseControl>
            )}
        </PostMeta>
    );
};
```

Because the PHP `MovieRuntime` field is registered as type `object` with `hours` and `minutes` properties, the `setMeta` call passes a matching object shape.

## Tasks

### Bulk copy

Copy the entire `block-plugins/` and `block-components/` directories from the fueled-movies theme into your `assets/js/`. Add `import './block-plugins'` to `block-extensions.js`. Rebuild.

### Walk through 2-3 examples

Students don't need to create each field by hand. The pattern repeats. Walk through these examples to understand how it works:

1. **The panel registration pattern.** Open `movie-meta-fields.js`. Identify the `registerPlugin` call, the `PluginDocumentSettingPanel`, the post type check via `usePost()`, and how field components are composed inside a `Flex`.

2. **A simple text field.** Open one `PostMeta` component (e.g. `MoviePlot.js` or `MovieIMDBID.js`). See how the `@10up/block-components` `PostMeta` render prop pattern works vs the vanilla `useEntityProp` hook shown above. Both are valid approaches.

3. **A more advanced control.** Open `PersonBorn.js`. This shows a reusable shared component (`DateTimePopover.js`) using `Dropdown` + `DateTimePicker`, and how to format/parse date strings for meta storage.

After the walkthrough, explore the remaining components on your own. The pattern repeats.

### Test

Edit a Movie and Person post to confirm panels appear and fields persist.

TODO_SUGGEST_SCREENSHOT

4. **Test persistence.** Set a value, save the post, refresh. Confirm the value persists. Check the REST API response at `/wp-json/wp/v2/tenup-movie/{id}`.

## Takeaways

- Use `PluginDocumentSettingPanel`, not custom metaboxes.
- `useEntityProp` is the standard hook for reading/writing post meta in the editor. The `PostMeta` component from `@10up/block-components` wraps it with a cleaner API.
- Scope panels to the correct post type by checking `postType` and returning `null` if it doesn't match.
- Keep meta components small — one component per field.
- Complex meta (objects, arrays) works the same way — the shape passed to `setMeta` must match the REST schema.

## Ship it checkpoint

- A document panel appears only for the intended post type
- Editing a field updates post meta and persists after refresh

## Further reading

- [SlotFill lesson (Blocks training)](../Blocks/08-slot-fill.md)
- [ToolsPanel guide](/guides/tools-panel)
