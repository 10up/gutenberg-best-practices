# ToolsPanel and ToolsPanelItem

## Preface:
WordPress recently adopted a new UI approach for grouping related settings in the Inspector Controls sidebar. Instead of grouping the settings in PanelBody components which create an accordion based user experience, the new ToolPanel approach allows users to toggle individual settings from a semantic group. This reduces the number of unused controls shown to the user when they open a block sidebar. This approach also makes it much easier for block extenders (developers) to add additional settings into these semantic panels. For example: a block has a custom typography setting which isn't already in core such as, writing mode, you can create a block extension and add your own custom setting into the typography panel of a block.

## Reference Guide WordPress Documentation:
* [ToolsPanel](https://developer.wordpress.org/block-editor/reference-guides/components/tools-panel/)
* [ToolsPanelItem](https://developer.wordpress.org/block-editor/reference-guides/components/tools-panel-item/)

Both of these are **experimental**.

## Use Case:
If you have custom controls that should exist within or be added to an existing block support panels group in the WP Admin block settings and you would like a fine grained ability on when to enable or have the user enable a specific control. This functionality also provides the benefit of resetting a control to a default state. Additionally new panels can be created using `ToolsPanel` as shown in the example below where a new `Animation` panel would be created.

### Caveats:
* When enabling the controls they must be tied to a block support panel group ie: `border`, `color`, `dimensions`, `typography` or `styles`.
* It is best to use a `ToolsPanel` if there will be multiple `ToolsPanelItem`'s within a specific block support panel group. `ToolsPanelItem` is preferred if there is just a singluar `ToolsPanelItem` within a group.
* `ToolsPanel` provides a `resetAll` function that can take each `ToolsPanelItem`'s singular `resetAllFilter` by passing an array of
these functions through to the panel’s `resetAll` callback to iterate over to reset all data within that panel simultaneously.

## Code Example:
The example below showcases three usages within an `edit.js` file within a custom block:
1. Using a `ToolsPanelItem` to create a singular control that adjusts the alignment of a block within the `typography` group
2. Using a `ToolsPanel` for multiple `ToolsPanelItem`'s in this situation there are multiple controls within the `styles` group that would be used together to create an animation
3. Using a `ToolsPanelItem` to create a singular control that adjusts the width of the block inside the `dimensions` group it also has the `isShownByDefault` which means it will always be displayed inside the block settings and does not need to be clicked on to enable and display.

```bash
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, useSetting, RichText } from '@wordpress/block-editor';
import {
	SelectControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

const ExampleBlockEdit = (props) => {
	const { attributes, setAttributes, clientId } = props;
	const { title, width, animationName, animationDuration, animationEasing, alignment } =
		attributes;

	const blockProps = useBlockProps({
		style: {
			width,
			textAlign: alignment,
			animationName,
			animationDuration,
			animationTimingFunction: animationEasing,
		},
	});

	const units = useSetting('spacing.units');

	const resetAll = () => {
		setAttributes({
			animationName: '',
			animationDuration: '',
			animationEasing: '',
		});
	};

	return (
		<>
			<InspectorControls group="typography">
				<ToolsPanelItem
					hasValue={() => !!alignment}
					label={__('Alignment')}
					onDeselect={() => setAttributes({ alignment: undefined })}
					resetAllFilter={() => ({
						alignment: undefined,
					})}
					onSelect={() => setAttributes({ alignment: 'left' })}
					panelId={clientId}
				>
					<ToggleGroupControl
						label={__('Toggle')}
						value={alignment}
						onChange={(value) => setAttributes({ alignment: value })}
					>
						<ToggleGroupControlOption value="left" label={__('Left')} />
						<ToggleGroupControlOption value="right" label={__('Right')} />
					</ToggleGroupControl>
				</ToolsPanelItem>
			</InspectorControls>
			<InspectorControls group="styles">
				<ToolsPanel label={__('Animation')} resetAll={resetAll}>
					<ToolsPanelItem
						hasValue={() => !!animationName}
						label={__('Name')}
						onDeselect={() => setAttributes({ animationName: undefined })}
						onSelect={() => setAttributes({ animationName: 'fade-in' })}
					>
						<SelectControl
							label={__('Animation Name')}
							value={animationName}
							onChange={(value) => setAttributes({ animationName: value })}
							options={[
								{
									label: __('Fade In'),
									value: 'fade-in',
								},
								{
									label: __('Slide In Down'),
									value: 'slide-in-down-fade',
								},
								{
									label: __('Slide In Up'),
									value: 'slide-in-up-fade',
								},
								{
									label: __('Slide In Left'),
									value: 'slide-in-left-fade',
								},
								{
									label: __('Slide In Right'),
									value: 'slide-in-right-fade',
								},
							]}
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						hasValue={() => !!animationDuration}
						label={__('Duration')}
						onDeselect={() => setAttributes({ animationDuration: undefined })}
						onSelect={() => setAttributes({ animationDuration: '300' })}
					>
						<SelectControl
							label={__('Animation Duration')}
							value={animationDuration}
							onChange={(value) => setAttributes({ animationDuration: value })}
							options={[
								{ label: __('150ms'), value: '150' },
								{ label: __('200ms'), value: '200' },
								{ label: __('250ms'), value: '250' },
								{ label: __('300ms'), value: '300' },
								{ label: __('350ms'), value: '350' },
								{ label: __('400ms'), value: '400' },
								{ label: __('450ms'), value: '450' },
								{ label: __('500ms'), value: '500' },
							]}
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						hasValue={() => !!animationEasing}
						label={__('Easing')}
						onDeselect={() => setAttributes({ animationEasing: undefined })}
						onSelect={() => setAttributes({ animationEasing: 'ease' })}
					>
						<SelectControl
							label={__('Animation Easing')}
							value={animationEasing}
							onChange={(value) => setAttributes({ animationEasing: value })}
							options={[
								{ label: __('Ease'), value: 'ease' },
								{
									label: __('Ease In'),
									value: 'ease-in',
								},
								{
									label: __('Ease Out'),
									value: 'ease-out',
								},
								{
									label: __('Ease In Out'),
									value: 'ease-in-out',
								},
								{
									label: __('Linear'),
									value: 'linear',
								},
							]}
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>
			<InspectorControls group="dimensions">
				<ToolsPanelItem
					hasValue={() => !!width}
					label={__('Width')}
					onDeselect={() => setAttributes({ width: undefined })}
					resetAllFilter={() => ({
						width: undefined,
					})}
					isShownByDefault
					panelId={clientId}
				>
					<UnitControl
						label={__('Width')}
						labelPosition="top"
						value={width || ''}
						min={0}
						onChange={(value) => setAttributes({ width: value })}
						units={units}
					/>
				</ToolsPanelItem>
			</InspectorControls>
			<div {...blockProps}>
				<RichText
					className="wp-block-example-block__title"
					tagName="h2"
					placeholder={__('Custom Title')}
					value={title}
					onChange={(title) => setAttributes({ title })}
				/>
			</div>
		</>
	);
};
export default ExampleBlockEdit;
```
