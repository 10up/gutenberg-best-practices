---
sidebar_label: "13. Interactivity API: Rate a Movie"
sidebar_position: 13
---

# 13. Interactivity API: Rate a Movie

The Interactivity API replaces ad-hoc frontend JavaScript with a declarative system. Instead of `querySelector` and event listeners, you use `data-wp-*` directives that connect HTML to a reactive store. The block renders meaningful HTML on the server, and the API enhances it on the client.

This lesson walks through the `tenup/rate-movie` block: a fully interactive star rating widget built entirely with the Interactivity API.

## Learning Outcomes

1. Understand the Interactivity API: stores, state, actions, callbacks, and `data-wp-*` directives.
2. Know how to wire a `view-module.js` to a block via `block.json`.
3. Be able to build interactive UI with proper accessibility.
4. Understand progressive enhancement: the block should be meaningful without JS.
5. Know the `do_blocks()` pattern for rendering block markup from PHP.

## Tasks

### 1. Copy the block from the answer key

Copy the `blocks/rate-movie/` directory from the `fueled-movies` theme.

Update `package.json` to add the `@wordpress/interactivity` dependency and `useScriptModules: true` in the toolkit config. Rebuild:

```bash
npm install && npm run build
```

### 2. Review block.json

```json title="blocks/rate-movie/block.json (partial)"
{
    "name": "tenup/rate-movie",
    "title": "Rate Movie",
    "supports": {
        "html": false,
        "interactivity": {
            "interactive": true,
            "clientNavigation": true
        }
    },
    "render": "file:./markup.php",
    "editorScript": "file:./index.js",
    "viewScriptModule": "file:./view-module.js",
    "style": "file:./style.css"
}
```

Key entries:

- **`viewScriptModule`**: points to the Interactivity API store. WordPress loads this as an ES module only on the frontend, only when the block is present.
- **`supports.interactivity`**: enables the Interactivity API for this block. `clientNavigation: true` allows the store to persist across client-side navigations.

### 3. Walk through the server-rendered markup

The `markup.php` file outputs HTML with `data-wp-*` directives:

```php title="blocks/rate-movie/markup.php (simplified)"
<?php
$block_wrapper_attributes = get_block_wrapper_attributes( [
    'data-wp-context'     => wp_json_encode( [ 'rating' => null ] ),
    'data-wp-interactive' => 'tenup/rate-movie',
] );
?>

<div <?php echo $block_wrapper_attributes; ?>>

    <!-- Trigger button -->
    <button
        aria-controls="rate-movie-popover"
        aria-haspopup="true"
        class="wp-block-tenup-rate-movie__trigger"
        data-wp-bind--aria-expanded="state.isPopoverOpen"
        data-wp-text="state.buttonText"
        popovertarget="rate-movie-popover"
        type="button"
    >Rate</button>

    <!-- Popover dialog -->
    <div
        aria-labelledby="rate-movie-popover-label"
        aria-modal="true"
        class="wp-block-tenup-rate-movie__popover"
        data-wp-class--is-open="state.isPopoverOpen"
        data-wp-init="callbacks.initPopover"
        id="rate-movie-popover"
        popover
        role="dialog"
    >
        <!-- Range slider -->
        <label>
            <span class="visually-hidden">Rate this movie from 1 to 10</span>
            <input
                data-wp-bind--value="state.sliderValue"
                data-wp-on--input="actions.selectRating"
                max="10" min="1" step="1"
                type="range"
            />
        </label>

        <!-- Rating display -->
        <span data-wp-text="state.popupRatingText"></span>

        <!-- Clear button -->
        <button
            data-wp-class--is-hidden="!state.hasRating"
            data-wp-on--click="actions.clearRating"
            type="button"
        >Clear</button>
    </div>
</div>
```

#### Directive reference

| Directive | What it does | Example |
| --------- | ------------ | ------- |
| `data-wp-interactive` | Declares which store this block uses | `"tenup/rate-movie"` |
| `data-wp-context` | Sets initial reactive context for this block instance | `{ "rating": null }` |
| `data-wp-text` | Replaces text content with a state value | `state.buttonText` |
| `data-wp-bind--{attr}` | Binds an HTML attribute to state | `data-wp-bind--aria-expanded="state.isPopoverOpen"` |
| `data-wp-on--{event}` | Attaches an event handler to an action | `data-wp-on--click="actions.clearRating"` |
| `data-wp-class--{name}` | Toggles a CSS class based on state | `data-wp-class--is-open="state.isPopoverOpen"` |
| `data-wp-init` | Runs a callback when the element enters the DOM | `callbacks.initPopover` |

#### The do_blocks() pattern

The `markup.php` uses `do_blocks()` to render Button blocks from PHP. This ensures the buttons get proper block-style-variation CSS applied:

```php title="blocks/rate-movie/markup.php (do_blocks pattern)"
$trigger_button = '
<!-- wp:button {"tagName":"button"} -->
<div class="wp-block-button">
    <button class="wp-block-button__link wp-element-button"
        data-wp-bind--aria-expanded="state.isPopoverOpen"
        data-wp-text="state.buttonText"
        popovertarget="rate-movie-popover"
        type="button"
    >Rate</button>
</div>
<!-- /wp:button -->
';

echo do_blocks( $trigger_button );
```

By wrapping the HTML in block comments and running it through `do_blocks()`, WordPress processes it as if it were a real block, applying any style variation CSS that's been registered. This is how the "is-style-secondary" variation on the Clear button gets its styling even though the button is defined in PHP.

### 4. Walk through the store

```js title="blocks/rate-movie/view-module.js"
import { store, getContext, getElement } from '@wordpress/interactivity';

const { state } = store('tenup/rate-movie', {
    state: {
        isPopoverOpen: false,

        get hasRating() {
            const context = getContext();
            return context.rating !== null && context.rating > 0;
        },

        get buttonText() {
            if (state.isPopoverOpen) return 'Rate';
            const context = getContext();
            return context.rating > 0 ? `${context.rating}/10` : 'Rate';
        },

        get sliderValue() {
            const context = getContext();
            return context.rating !== null ? context.rating : 1;
        },
    },

    actions: {
        selectRating(event) {
            const context = getContext();
            const value = parseInt(event.target.value, 10);
            context.rating = value >= 1 && value <= 10 ? value : null;
        },
        clearRating() {
            getContext().rating = null;
        },
    },

    callbacks: {
        initPopover() {
            const { ref } = getElement();
            if (!ref) return;
            const root = ref.closest('.wp-block-tenup-rate-movie') ?? ref.parentElement;
            const popover = ref;
            const button = root?.querySelector('.wp-block-tenup-rate-movie__trigger');

            if (!popover || !button) return;

            const updateState = () => {
                state.isPopoverOpen = popover.matches(':popover-open');
                button.setAttribute('aria-expanded', state.isPopoverOpen ? 'true' : 'false');
            };

            popover.addEventListener('toggle', updateState);
            updateState();
        },
    },
});
```

Key concepts:

- **`store()`**: creates a reactive store namespaced to `'tenup/rate-movie'`. The namespace must match the `data-wp-interactive` attribute in the markup.
- **`getContext()`**: returns the reactive context for the current block instance. Each rate-movie block on the page has its own `rating` value.
- **Computed state**: `get` properties like `buttonText` are derived from context. They recompute automatically when their dependencies change.
- **Actions**: functions called by `data-wp-on--*` directives. `selectRating` reads the slider value and updates context.
- **Callbacks**: functions called by `data-wp-init` (on mount) or `data-wp-watch` (on change). `initPopover` sets up the native popover toggle listener.

### Interaction flow

1. User clicks the "Rate" button, the native `popover` API opens the dialog
2. `initPopover` callback fires on the `toggle` event, sets `state.isPopoverOpen = true`
3. `data-wp-bind--aria-expanded` updates the button's ARIA attribute
4. User drags the range slider, `data-wp-on--input` fires `actions.selectRating`
5. `selectRating` parses the value and sets `context.rating`
6. `data-wp-text="state.buttonText"` reactively updates to show `"7/10"`
7. User clicks "Clear", `actions.clearRating` sets `context.rating = null`
8. Button text reverts to "Rate"

### 5. Add to the single movie template

Revisit `templates/single-tenup-movie.html` in the Site Editor. Add `<!-- wp:tenup/rate-movie /-->` in the movie header area (near the title and metadata row).

Export the updated markup back to the theme file.

TODO_SUGGEST_SCREENSHOT

### 6. Test accessibility

The rate-movie block demonstrates several important accessibility patterns:

- **`aria-haspopup`** on the trigger button tells assistive technology a dialog will appear
- **`aria-expanded`** toggles dynamically via `data-wp-bind--aria-expanded`
- **`aria-modal`** and **`role="dialog"`** on the popover identify it as a modal
- **`aria-labelledby`** connects the popover to its heading
- **Visually hidden label** on the range slider: "Rate this movie from 1 to 10"
- **Native `popover` API** provides built-in focus management and Escape key behavior

Use VoiceOver (macOS) or a screen reader to verify:
- `aria-expanded` toggles on the trigger button
- The popover is announced as a dialog
- Keyboard navigation works (Tab, Escape)

:::caution
The Interactivity API is not a replacement for React. It's designed for server-rendered blocks that need client-side behavior. Editor-side interactivity still lives in `edit.js` with React.
:::

## Files changed (fueled-movies delta)

| File | Change type | What changes |
| ---- | ----------- | ------------ |
| `package.json` | Modified | Added `@wordpress/interactivity` dependency; `useScriptModules: true` in toolkit config |
| `blocks/rate-movie/block.json` | **New** | Interactive block metadata with `viewScriptModule` |
| `blocks/rate-movie/markup.php` | **New** | Server-rendered HTML with `data-wp-*` directives, `do_blocks()` pattern for buttons |
| `blocks/rate-movie/view-module.js` | **New** | Interactivity API store with state, actions, callbacks |
| `blocks/rate-movie/index.js` | **New** | Minimal editor registration |
| `blocks/rate-movie/style.css` | **New** | Popover, trigger, slider, and rating display styles |
| `templates/single-tenup-movie.html` | **Revisited** | Added `<!-- wp:tenup/rate-movie /-->` in movie header area |

## Ship it checkpoint

- The block uses a view module with store state/actions (no console errors)
- Accessibility: popover labeling, `aria-expanded`, keyboard navigation all work
- State rules enforced (null initial, range 1-10, clear resets to null)
- Rating displays on the button after selection ("7/10")

TODO_SUGGEST_SCREENSHOT

## Takeaways

- The Interactivity API adds frontend behavior to server-rendered blocks declaratively.
- Directives (`data-wp-on--click`, `data-wp-bind--*`, `data-wp-text`) connect HTML to store state.
- Always server-render the initial HTML in `markup.php`. The API enhances it, not replaces it.
- Each block instance has its own context via `data-wp-context` and `getContext()`.
- Computed state (`get` properties) automatically updates when dependencies change.
- Accessibility is not optional: ARIA attributes, keyboard support, screen reader testing.
- Use `do_blocks()` when outputting block markup from PHP to ensure style variations are applied.

## Further reading

- [Interactivity API getting started](/guides/interactivity-api-getting-started)
