---
sidebar_label: "7. Content Model: CPTs, Taxonomies, and Post Meta"
sidebar_position: 7
---

# 7. Content Model — CPTs, Taxonomies, and Post Meta

Up to now we've been working inside the theme. This lesson shifts to the MU plugin, where the content model lives. Data should persist regardless of which theme is active — that's why CPTs, taxonomies, meta fields, and relationships belong in the plugin layer, not the theme.

## Learning Outcomes

1. Know how CPTs, taxonomies, and post meta are defined in the MU plugin.
2. Understand the `ModuleInterface` pattern and how modules auto-register.
3. Be able to add a new meta field and confirm it appears in the REST API.
4. Understand why `show_in_rest` is the key that unlocks everything downstream.

## The module system

The `10up-plugin` uses the [10up PHP framework](https://github.com/10up/wp-framework) — specifically the `ModuleInterface` and `Module` trait — to auto-discover and register classes.

Here's the initialization flow:

1. `plugin.php` creates `new PluginCore()` and calls `$plugin_core->setup()`
2. `PluginCore::init()` calls `ModuleInitialization::instance()->init_classes( TENUP_PLUGIN_INC )`
3. `ModuleInitialization` scans all PHP classes in `src/`
4. For each class implementing `ModuleInterface`, it calls `can_register()` → if true, calls `register()`

> 📐 **Diagram suggestion**: A flowchart showing: `plugin.php` → `PluginCore::setup()` → `init()` → `ModuleInitialization` → scans `src/` → `can_register()` → `register()`.

Every module implements `ModuleInterface` with three methods:

```php
interface ModuleInterface {
    public function can_register(): bool;  // Should this module load?
    public function register();            // Hook in
    public function load_order(): int;     // Priority (lower = earlier)
}
```

Drop a new PHP class in `src/` that implements this interface and it will be auto-discovered — no manual registration needed.

## Custom post types

CPTs extend `AbstractPostType` from the framework. Here's the Movie post type:

```php title="mu-plugins/10up-plugin/src/PostTypes/Movie.php (key parts)"
namespace TenUpPlugin\PostTypes;

use TenupFramework\PostTypes\AbstractPostType;

class Movie extends AbstractPostType {

    const POST_TYPE      = 'tenup-movie';
    const SINGULAR_LABEL = 'Movie';
    const PLURAL_LABEL   = 'Movies';

    public function get_name() {
        return self::POST_TYPE;
    }

    public function get_editor_supports() {
        $options = parent::get_editor_supports();
        return array_merge( $options, [ 'custom-fields' ] );
    }

    public function get_options() {
        $options = parent::get_options();
        return array_merge( $options, [
            'rewrite' => [ 'slug' => 'movies' ],
        ] );
    }

    public function get_supported_taxonomies() {
        return [ 'tenup-genre' ];
    }
}
```

Key things to note:

- **`custom-fields` support** is required for post meta to work with the block editor and the Block Bindings API. Without it, the REST API won't expose meta fields for this post type.
- **Constants** (`POST_TYPE`, `SINGULAR_LABEL`) keep the slug and labels in one place. Other classes reference `Movie::POST_TYPE` instead of hardcoding strings.
- The `Person` post type follows the same pattern with `tenup-person` and a `people` rewrite slug.

## Taxonomies

Taxonomies extend `AbstractTaxonomy`:

```php title="mu-plugins/10up-plugin/src/Taxonomies/Genre.php (key parts)"
namespace TenUpPlugin\Taxonomies;

use TenupFramework\Taxonomies\AbstractTaxonomy;
use TenUpPlugin\PostTypes\Movie;

class Genre extends AbstractTaxonomy {

    const TAXONOMY_NAME  = 'tenup-genre';
    const SINGULAR_LABEL = 'Genre';
    const PLURAL_LABEL   = 'Genres';

    public function get_post_types() {
        return [ Movie::POST_TYPE ];
    }
}
```

The `get_post_types()` method associates the taxonomy with one or more post types. The framework handles `register_taxonomy()` and all the label generation.

## Post meta

Post meta fields extend `AbstractPostMeta`. The abstract class handles `register_post_meta()` and provides a consistent interface for defining field type, default value, REST schema, and allowed values.

Here's a simple string field:

```php title="Example: a string meta field (simplified)"
class MoviePlot extends AbstractPostMeta {

    const META_KEY = 'tenup_movie_plot';

    protected $type = 'string';

    public function get_post_types(): array {
        return [ Movie::POST_TYPE ];
    }
}
```

And a complex object field — `MovieRuntime` stores hours and minutes as a structured object:

```php title="mu-plugins/10up-plugin/src/PostMeta/MovieRuntime.php (key parts)"
class MovieRuntime extends AbstractPostMeta {

    const META_KEY = 'tenup_movie_runtime';

    protected $type = 'object';

    protected $default_value = [
        'hours'   => '0',
        'minutes' => '0',
    ];

    public function get_schema(): array {
        $schema = parent::get_schema();

        $schema['schema']['properties'] = [
            'hours'   => [
                'type'        => 'string',
                'description' => __( 'Hours', 'tenup' ),
            ],
            'minutes' => [
                'type'        => 'string',
                'description' => __( 'Minutes', 'tenup' ),
            ],
        ];

        return $schema;
    }

    public function get_post_types(): array {
        return [ Movie::POST_TYPE ];
    }
}
```

The abstract class automatically includes `show_in_rest` with the schema — this is what makes the field visible to the REST API, the block editor, and block bindings.

:::tip
`show_in_rest` is the single most important flag for any meta field. Without it, the field is invisible to the editor, block bindings, and JavaScript. If a field doesn't appear where you expect, check `show_in_rest` first.
:::

### All 15 meta fields

The plugin defines 15 meta fields across two post types:

**Movie** (9 fields): `tenup_movie_imdb_id`, `tenup_movie_mpa_rating`, `tenup_movie_plot`, `tenup_movie_release_year`, `tenup_movie_runtime` (object), `tenup_movie_viewer_rating`, `tenup_movie_viewer_rating_count`, `tenup_movie_trailer_id`

**Person** (6 fields): `tenup_person_biography`, `tenup_person_birthplace`, `tenup_person_born`, `tenup_person_deathplace`, `tenup_person_died`, `tenup_person_imdb_id`

## Relationships

The plugin uses [Content Connect](https://github.com/10up/content-connect) for bidirectional many-to-many relationships between post types.

```php title="mu-plugins/10up-plugin/src/Relationships.php (simplified)"
class Relationships implements ModuleInterface {

    public static $relationships;

    public function __construct() {
        self::$relationships = [
            'movie_person' => [
                'from' => [
                    'cpt'  => Movie::POST_TYPE,
                    'name' => __( 'Related People', 'tenup' ),
                ],
                'to' => [
                    'cpt'  => Person::POST_TYPE,
                    'name' => __( 'Related Movies', 'tenup' ),
                ],
            ],
        ];
    }

    public function register() {
        add_action( 'tenup-content-connect-init', [ get_called_class(), 'define_relationships' ] );
    }
}
```

This creates a bidirectional relationship between Movies and People. From the admin, editors can relate a Movie to its cast members, and those relationships are queryable from both sides. The theme's Block Bindings (covered in [Lesson 9](./09-block-bindings.md)) use Content Connect to display linked names.

## Tasks

1. **Trace the initialization flow.** Start at `plugin.php`, follow to `PluginCore.php`, and see how `ModuleInitialization::instance()->init_classes()` auto-discovers classes.

> 📐 **Diagram suggestion**: Flowchart showing `plugin.php` → `PluginCore::init()` → `ModuleInitialization` → scans `src/` → `can_register()` → `register()`.

2. **Read a CPT definition.** Open `PostTypes/Movie.php`. Note the slug, rewrite, supported taxonomies, and `custom-fields` support.

3. **Read the abstract meta class.** Open `AbstractPostMeta.php`. See how `register_post_meta()` is called with `show_in_rest`, `single`, `type`, and optional `default`/`enum`.

4. **Add a new meta field.** Create a class (e.g. `MovieTagline.php`) extending `AbstractPostMeta`. Set the key to `tenup_movie_tagline`, type to `string`, and return `Movie::POST_TYPE` from `get_post_types()`. Verify it appears in the REST response: `/wp-json/wp/v2/tenup-movie/{id}`.

5. **Test the relationship.** In the admin, edit a Movie and use the Content Connect UI to relate it to a Person. Verify the relationship persists and is queryable from both sides.

## Takeaways

- The content model belongs in the MU plugin. Data outlives design.
- All modules implement `ModuleInterface` with `can_register()`, `register()`, and `load_order()`.
- `show_in_rest` is the single most important flag — without it, the field is invisible to the editor, bindings, and JS.
- Complex meta (like `MovieRuntime`) uses the `object` type with a `properties` schema.
- Content Connect provides bidirectional many-to-many relationships between post types.

## Ship it checkpoint

- The CPT works end-to-end (archive + single resolve, permalinks work)
- A meta field is registered with `show_in_rest` and persists when edited via REST

## Further reading

- [Custom Post Types](/reference/custom-post-types)
