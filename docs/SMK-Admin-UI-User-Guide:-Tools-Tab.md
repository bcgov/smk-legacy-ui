# SMK Admin UI User Guide - Tools Tab
[Back to the Config Editor Page](https://github.com/bcgov/smk/wiki/SMK-Admin-UI-User-Guide%3A-Configuration-Editor)

[Back to ToC](https://github.com/bcgov/smk/wiki/SMK-Admin-UI-User-Guide)

The Tools tab is where you'll be able to add and modify tools for your site. Tools include all interface and interactable components of your site. The following tools are available for modification:

* Panning
* Zooming
* Directions
* Coordinates
* Scale
* Mini Map
* Attribution
* Measurement
* Markup
* About Panel
* Base Map Selector
* Layer Selector
* Identify Panel
* Feature Selection Panel
* Search Panel

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools.jpg)

On the left of the Tools Tab, you'll see a list of all of the configurable tools the Admin UI allows you to edit, along will a check box to the left of the title. These check boxes enable or disable a tool. If the box is checked, the tool will be active and available for use by your site. If the box is un-checked, the tool will be disabled and will not be present in your application.

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_toggle.jpg)

On the right of the Tools Tab, you'll see a series of accordion panels that contain all of the configurable options for a tool. Some tools have no options (you can only enable or disable them) and therefore have no panel. Additionally, if you disable a tool, the accordion panel for that tools options will be hidden.

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_panels.jpg)

To access a tools configuration, click on the accordion panel header for the tool you wish to modify. It will pop open, and present you will the available options.

## Tool Details
### Panning
When the Panning tool is enabled, it activates the ability for your map to be panned by clicking, holding and dragging the mouse. If the panning tool is disabled, you will not be able to pan your map at all. This is useful when combined with disabling the Zooming tool for a map where you want to keep a static extent active at all times.

The Panning tool has no additional options
### Zooming
When the Zooming tool is enabled, it activates the ability for your map to be zoomed in and out to different scales. If the Zooming tool is disabled, you will not be able to change the zoom level of your map at all. This is useful when combined with disabling the Panning tool for a map where you want to keep a static extent active at all times.

The Zooming tool has the following options:

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_zoom.jpg)

* Zoom Control Visible on map
  * Determines if the zoom controls will be shown on the map, and not just driven by other controls
* Zoom with Box
  * Enables the ability for the user to hold the "Ctrl" key on their keyboard which clicking, holding, and dragging a box on the map. The map will be zoomed to the drawn extent upon releasing the mouse button
* Zoom in by Double-Click
  * Enables the ability for the user to double-click their mouse button to zoom in
* Zoom with Mouse Wheel
  * Enables the ability for the user to zoom in using the mouse wheel.
### Directions
![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_directions.jpg)
When the Directions Tool is enabled, a route planner will be added to your site. The Directions tool contains no additional configuration.

For instructions on using the Direction tool, please see the [SMK Client Documentation]()
### Coordinates
![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_scale.jpg)
When the Coordinates tool is enabled, the current coordinates (in latitude/longitude) where your mouse pointer is located will be displayed on the map, at the bottom right.

The Coordinates tool has no additional configuration.
### Scale
When the Scale tool is enabled, the current map scale will be displayed on the map at the bottom right.

The Scale tool has the following options:
![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_scale_opt.jpg)
* Show a scale bar on map
  * Displays a scale bar on the map
* Show the scale factor on map
  * Displays the current extents scale factor
### Mini Map
When the Mini Map tool is enabled, a key map will be displayed on the bottom right corner of the map.

The Mini Map tool has the following options:
![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_minimap.jpg)

You have the option to choose which base map style will be used by the mini map. Select one of the radio buttons to set the base map style.
### Attribution
When the Attribution tool is enabled, any admin defined layer attribution will be added to the attribution bar at the bottom of the map.

The Attribution tool has no additional configuration.
### Measurement
When the Measurement tool is enabled, measurement utilities will be added to the map.

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_measure.jpg)

The Measurement tool has no additional configuration.
### Markup
When the Markup tool is enabled, custom markup and drawing utilities will be added to the map.

The Markup tool has no additional configuration.
### About Panel
When the About Panel tool is enabled, an additional panel will be activated in the site menu which contains any custom "about" html content supplied.

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_about.jpg)

The about content editor is an HTML editor. You can use the editor as you would any rich text editor, or optionally you can use an HTML editor mode and enter HTML content directly. To assist with about panel modification in rich text mode, a number of tools are available:

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_about_opt.jpg)

From left to right, top to bottom:
* HTML View
* Undo / Redo
* Bold / Emphasis / Strikethrough
* Super and Sub script
* Text and text Background color
* Text alignment
* Lists
* Horizontal rule
* Code block
* Remove Formatting (from a selection of text)
* add/edit Hyperlinks
* Insert Image (by URL)
* Insert Image (upload base64)
* Embed Video (by URL)

### Base Map Selector
When the Base Map Selector tool is enabled, a tool will be added to the menu that allows for changing the base map.

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_basemap.jpg)

You can choose one or more of the base maps listed in the configuration accordion to configure which additional base maps are available. The list of options is identical to the [base map tab](https://github.com/bcgov/smk/wiki/SMK-Admin-UI-User-Guide:-Basemap-Tab) options.

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_basemap_pnl.jpg)
### Layer Selector
When the Layer Selector tool is enabled, a panel will be added to the site from the toolbar menu that allows the user to view the list of available layers, and set layer visibility. Additionally, a layer legend is available from this panel.

The Layer Selection Tool has no additional configuration.
### Identify Panel
When the Identify tool is enabled, you will be able to click anywhere on the map where a feature is located, and the source information will be queried with the results returned as defined in your layer setup (attribute titles, popup template, etc).

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_identify.jpg)

The Identify tool has a number of configurations, which determine how the highlighted feature will look.

* Layer Opacity
  * The "Layer Opacity" textbox accepts decimal values representing the opacity of the identify highlight. Acceptable values are 0.0 to 1.0, where 0.0 is totally transparent, and 1.0 is completely visible. Any number higher than 1.0 will be defaulted to 1.0. 
* Stroke Opacity
  * The "Stroke Opacity" textbox works in the same way as the Layer Opacity box does. This box sets the opacity for the highlighted linestring and polygon outlines. Stroke Opacity is independent of layer opacity. If your layer opacity is set to 1.0, and the stroke opacity is set to 0.5, linestrings and polygon outlines will display at 0.5 opacity.
* Fill Opacity
  * The "Fill Opacity" textbox works in the same way as the Stroke Opacity box does. This box sets the opacity for highlighted polygon fill colors.
* Stroke Width
  * The "Stroke Width" textbox accepts decimal values, and determine how thick a linestring or polygon outline will be drawn. The higher the value, the thicker the line. If the stroke is set to 0, no border or linestring will be drawn at all.
* Stroke Style
  * The "Stroke Style" textbox accepts a comma-seperated string of numbers, representing dash lengths. By default, Stroke Style is set to 1, for a solid line. The Stroke Style follows the [SVG standard](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
* Stroke and Fill Color Pickers
  * Stroke Color and Fill Color are colour pickers which allow you to select a color for the stroke and fill of the highlight. Colours are stored using hex color codes. If you're using a browser that does not accept the HTML5 Color picker input, you can enter a hex code in the text box that will replace it.
* Show in Panel Checkbox
  * If enabled The "Show in Panel" checkbox will open a panel in the menu and display all identified results for all identifiable layers.
### Feature Selection Panel
When the Feature Selection tool is enabled, you will be able to add any identified features to a selection cache, including their attributes and geometry. This tool requires the identify tool to be active.

![Tools Tab](https://github.com/dhlevi/smk/blob/master/smk-parent/smk-ui/docs/smk_admin_editor_tools_select.jpg)

The Feature Selection tool has a number of configurations, which determine how the selected feature will look.

* Layer Opacity
  * The "Layer Opacity" textbox accepts decimal values representing the opacity of the whole layer. Acceptable values are 0.0 to 1.0, where 0.0 is totally transparent, and 1.0 is completely visible. Any number higher than 1.0 will be defaulted to 1.0. 
* Stroke Opacity
  * The "Stroke Opacity" textbox works in the same way as the Layer Opacity box does. This box sets the opacity for linestring and polygon outlines. Stroke Opacity is independent of layer opacity. If your layer opacity is set to 1.0, and the stroke opacity is set to 0.5, linestrings and polygon outlines will display at 0.5 opacity.
* Fill Opacity
  * The "Fill Opacity" textbox works in the same way as the Stroke Opacity box does. This box sets the opacity for polygon fill colors.
* Stroke Width
  * The "Stroke Width" textbox accepts decimal values, and determine how thick a linestring or polygon outline will be drawn. The higher the value, the thicker the line. If the stroke is set to 0, no border or linestring will be drawn at all.
* Stroke Style
  * The "Stroke Style" textbox accepts a comma-seperated string of numbers, representing dash lengths. By default, Stroke Style is set to 1, for a solid line. The Stroke Style follows the [SVG standard](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
* Stroke and Fill Color Pickers
  * Stroke Color and Fill Color are colour pickers which allow you to select a color for the stroke and fill of a feature. Colours are stored using hex color codes. If you're using a browser that does not accept the HTML5 Color picker input, you can enter a hex code in the text box that will replace it.
### Search Panel
When the Search Panel tool is enabled, a text box will be added to the site toolbar that will allow you to use the DataBC geolocation search services to locate cities, towns, and points of interest.

The Search Panel tool has no additional configuration.