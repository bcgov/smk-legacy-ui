# Map Configuration Model:

| Path                     | Type            | Required | Description                                                                                                                                            |
| ------------------------ | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lmfId`                  | `String`        | `True`   | The SMK identifer for the Map Configuration                                                                                                            |
| `lmfRevision`            | `Integer`       | `True`   | The current version of the Map Configuration. This will increment when a version is published and a new edit version created                           |
| `name`                   | `String`        | `True`   | The name of an SMK application. This name is used for labels and display purposes                                                                      |
| `project`                | `String`        | `False`  | An optional *namespace* used to track Map Configurations together in a single project                                                                  |
| `createdBy`              | `String`        | `False`  | The name of the user (BCeID or IDIR) that created this Map Configuration                                                                               |
| `published`              | `boolean`       | `True`   | Indicats if this project is a published version. if False, this is an editable version                                                                 |
| `surround.type`          | `String`        | `False`  | The type of surround header to use currently only *default* is enabled                                                                                 |
| `surround.title`         | `String`        | `False`  | The title of the configuration, displayed in the header                                                                                                |
| `surround.imageSrc`      | `String`        | `False`  | A banner image to display in the header                                                                                                                |
| `viewer.type`            | `String`        | `True`   | The viewer type to use. This is currently either *leaflet* or *esri3d*                                                                                 |
| `viewer.baseMap`         | `String`        | `True`   | The name of the default basemap to display from SMK’s basemap options                                                                                  |
| `viewer.location.extent` | `Array[Double]` | `False`  | The default extent at which the map will be displayed. This will override center and zoom settings.                                                    |
| `viewer.location.center` | `Array[Double]` | `False`  | The center point to pan the map to when the application starts. This requires a zoom level set, and this will be overriden by setting an extent value. |
| `viewer.location.zoom`   | `Double`        | `False`  | The zoom level to set the map display to when the application starts. This requires a center point value.                                              |
| `tools`                  | `Array[Tool]`   | `True`   | The list of tools this Map Configuration will activate                                                                                                 |
| `layers`                 | `Array[Layer]`  | `True`   | The list of configured Layers that will be displayed in the viewer                                                                                     |

# Layer Configurations:

Layers have many different types. Each type is an extension of the root
*Layer*
type.

## Layer Model:

| Path                | Type               | Required | Description                                                                                                                                     |
| ------------------- | ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`              | `String`           | `True`   | Identifies which type of layer this is. Must be one of dynamicServiceLayer, wmsLayer, kmlLayer, jsonLayer, groupLayer, folder, or featureLayer  |
| `id`                | `Integer`          | `True`   | The identifer for a Layer                                                                                                                       |
| `title`             | `String`           | `True`   | The Layers title, used for display in the viewer                                                                                                |
| `isVisible`         | `Boolean`          | `True`   | Indicates if the layer will be visible in the viewer by default                                                                                 |
| `attribution`       | `String`           | `True`   | Copyright details and attribution to be displayed in the map viewer container                                                                   |
| `metadataUrl`       | `String`           | `True`   | The URL used for linking to a metadat source                                                                                                    |
| `opacity`           | `Double`           | `True`   | The default opacity the layer is displayed at. This will not override existing WMS congigured values, and may result in very hard to see layers |
| `minScale`          | `Double`           | `False`  | The minimum visible scale for the layer                                                                                                         |
| `maxScale`          | `Double`           | `False`  | The maximum visible scale for the layer                                                                                                         |
| `geometryAttribute` | `String`           | `False`  | The default geometry attribute, if attributes are set                                                                                           |
| `titleAttribute`    | `String`           | `False`  | The default title attribute, if attributes are set                                                                                              |
| `queries`           | `Array[Query]`     | `False`  | A list of query objects used for executing custom query actions                                                                                 |
| `attributes`        | `Array[Attribute]` | `False`  | An array of attribute values. Used to override what is displayed with Dynamic, Vector, and WMS layers.                                          |

## Attribute fields:

| Path      | Type      | Required | Description                                      |
| --------- | --------- | -------- | ------------------------------------------------ |
| `name`    | `String`  | `True`   | The database name of the attribute               |
| `alias`   | `String`  | `True`   | The label alias of the attribute                 |
| `visible` | `Boolean` | `True`   | Indicates if the attribute is visible by default |

One of the following models is required for each
layer

## Dynamic Service Layer Model:

| Path            | Type            | Required | Description                                                                                                                                       |
| --------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mpcmId`        | `Integer`       | `True`   | The ID used for this layer in the DataBC Layer Catalog                                                                                            |
| `mpcmWorkspace` | `String`        | `True`   | The workspace used for this layer in the DataBC Layer Catalog                                                                                     |
| `serviceUrl`    | `String`        | `True`   | The URL for the DataBC Layer Catalog                                                                                                              |
| `dynamicLayers` | `Array[String]` | `True`   | A listing of dynamic layer configurations. This will typically only contain one dynamic feature, which can be derived from the MPCM Layer Catalog |

## WMS Layer Model:

| Path         | Type     | Required | Description                                                                          |
| ------------ | -------- | -------- | ------------------------------------------------------------------------------------ |
| `version`    | `String` | `True`   | The WMS version used for get map, get feature info and get capabilities wms requests |
| `styleName`  | `String` | `True`   | The name of the style to use when making get map requests for the WMS layer          |
| `layerName`  | `String` | `True`   | The name of the layer to use when making get map requests for the WMS layer          |
| `serviceUrl` | `String` | `True`   | The URL for the WMS service                                                          |

## Vector Layer Model:

| Path                  | Type             | Required | Description                                                                                                                       |
| --------------------- | ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `dataUrl`             | `String`         | `False`  | A URL for an external GeoJSON file                                                                                                |
| `useRaw`              | `Boolean`        | `False`  | Indicates if the layer should be displayed in its native form, with no heatmapping or clustering. Only relevant for point vectors |
| `useClustering`       | `Boolean`        | `False`  | Indicates if the layer should also include point clustering. Only relevant for point vectors                                      |
| `useHeatmap`          | `Boolean`        | `False`  | Indicates if the layer should also include heatmap clustering. Only relevant for point vectors                                    |
| `style.strokeWidth`   | `Double`         | `False`  | Width of a line or polygon outline                                                                                                |
| `style.strokeStyle`   | `String`         | `False`  | Display style for a line or polygon outline (solid, dashed, dotted)                                                               |
| `style.strokeColor`   | `String`         | `False`  | The RGB color code for the line or polygon outline                                                                                |
| `style.strokeOpacity` | `Double`         | `False`  | The opacity of the line or polygon outline                                                                                        |
| `style.fillColor`     | `String`         | `False`  | The RGB color code for the polygon fill                                                                                           |
| `style.fillOpacity`   | `String`         | `False`  | The opacity for the polygon fill                                                                                                  |
| `style.markerUrl`     | `String`         | `False`  | The URL or attachment ID to use for custom point marker symbols                                                                   |
| `style.markerSize`    | `Array[Integer]` | `False`  | the x and y sizes to use for a custom marker symbol                                                                               |
| `style.markerOffset`  | `Array[Integer]` | `False`  | A default offset for drawing the custom marker symbol in relation to the real point location                                      |

## Tools Model:

| Path        | Type      | Required | Description                                                                                                                                                                                                                                                    |
| ----------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`   | `Boolean` | `False`  | Indicates if this tool is enabled or disabled by default. Disabled tools will not function in an applicaiton and will be removed from the UI                                                                                                                   |
| `title`     | `String`  | `False`  | The Title to use for a tool. All tools contain defaults, and will be overriden if title is supplied                                                                                                                                                            |
| `icon`      | `String`  | `False`  | The default icon to use for a tool. All tools contain defaults, and will be overriden if an icon name is supplied. Icons are derived from the Google Material Icons library                                                                                    |
| `order`     | `Integer` | `False`  | The Uorder in which the tool will be displayed in the toolbars                                                                                                                                                                                                 |
| `instance`  | `String`  | `False`  | The name of related tool instances to display with this tool. Currently, this is only used for query definitions                                                                                                                                               |
| `position`  | `String`  | `False`  | The location where the tool and icon will be displayed from. *Dropdown* requires the dropdown tool to be activated. By default tools are placed in the menu, but they can also be moved to the toolbar                                                         |
| `showPanel` | `Boolean` | `False`  | Indicates if the tool should be displayed with a panel. All tools default to True, except for the identify tool. This should only be set to False with the identify panel, as many other tools will have unknown behaviour if their required panels are hidden |

Some tools have specialized configurations in addition to the default
tool configuration above. These are listed
below:

## About Tool Model:

| Path      | Type     | Required | Description                                     |
| --------- | -------- | -------- | ----------------------------------------------- |
| `content` | `String` | `False`  | HTML content to be displayed in the about panel |

## Basemaps Tool Model:

| Path      | Type            | Required | Description                                                            |
| --------- | --------------- | -------- | ---------------------------------------------------------------------- |
| `choices` | `Array[String]` | `False`  | A listing of available basemap ID’s to offer in this map configuration |

## Identify Tool Model:

| Path                  | Type             | Required | Description                                                                                  |
| --------------------- | ---------------- | -------- | -------------------------------------------------------------------------------------------- |
| `styleOpacity`        | `Double`         | `False`  | The opacity of the identify tool feature highlighting                                        |
| `style.strokeWidth`   | `Double`         | `False`  | Width of a line or polygon outline                                                           |
| `style.strokeStyle`   | `String`         | `False`  | Display style for a line or polygon outline (solid, dashed, dotted)                          |
| `style.strokeColor`   | `String`         | `False`  | The RGB color code for the line or polygon outline                                           |
| `style.strokeOpacity` | `Double`         | `False`  | The opacity of the line or polygon outline                                                   |
| `style.fillColor`     | `String`         | `False`  | The RGB color code for the polygon fill                                                      |
| `style.fillOpacity`   | `String`         | `False`  | The opacity for the polygon fill                                                             |
| `style.markerUrl`     | `String`         | `False`  | The URL or attachment ID to use for custom point marker symbols                              |
| `style.markerSize`    | `Array[Integer]` | `False`  | the x and y sizes to use for a custom marker symbol                                          |
| `style.markerOffset`  | `Array[Integer]` | `False`  | A default offset for drawing the custom marker symbol in relation to the real point location |

## Mini Map Tool Model:

| Path      | Type     | Required | Description                                |
| --------- | -------- | -------- | ------------------------------------------ |
| `baseMap` | `String` | `True`   | The basemap ID for display in the Mini Map |

## Scale Tool Model:

| Path         | Type      | Required | Description                      |
| ------------ | --------- | -------- | -------------------------------- |
| `showFactor` | `Boolean` | `True`   | Display the scale as a factor    |
| `showBar`    | `Boolean` | `True`   | Display the scale in a scale bar |

## Select Tool Model:

| Path                  | Type             | Required | Description                                                                                  |
| --------------------- | ---------------- | -------- | -------------------------------------------------------------------------------------------- |
| `styleOpacity`        | `Double`         | `False`  | The opacity of the Select tool feature highlighting                                          |
| `style.strokeWidth`   | `Double`         | `False`  | Width of a line or polygon outline                                                           |
| `style.strokeStyle`   | `String`         | `False`  | Display style for a line or polygon outline (solid, dashed, dotted)                          |
| `style.strokeColor`   | `String`         | `False`  | The RGB color code for the line or polygon outline                                           |
| `style.strokeOpacity` | `Double`         | `False`  | The opacity of the line or polygon outline                                                   |
| `style.fillColor`     | `String`         | `False`  | The RGB color code for the polygon fill                                                      |
| `style.fillOpacity`   | `String`         | `False`  | The opacity for the polygon fill                                                             |
| `style.markerUrl`     | `String`         | `False`  | The URL or attachment ID to use for custom point marker symbols                              |
| `style.markerSize`    | `Array[Integer]` | `False`  | the x and y sizes to use for a custom marker symbol                                          |
| `style.markerOffset`  | `Array[Integer]` | `False`  | A default offset for drawing the custom marker symbol in relation to the real point location |

## Zoom Tool Model:

| Path          | Type      | Required | Description                                                    |
| ------------- | --------- | -------- | -------------------------------------------------------------- |
| `mouseWheel`  | `Boolean` | `False`  | Allow zooming with the mouse wheel                             |
| `doubleClick` | `Boolean` | `False`  | Allow zooming with a mouse *double-click*                      |
| `box`         | `Boolean` | `False`  | Allow zooming by clicking and dragging a box                   |
| `control`     | `Boolean` | `False`  | Allow zooming by holding control, clicking, and dragging a box |

# Query Configuration Model:

| Path                             | Type                              | Required | Description                                                                                                        |
| -------------------------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`                             | `String`                          | `True`   | The Query ID                                                                                                       |
| `title`                          | `String`                          | `True`   | The Query display title                                                                                            |
| `description`                    | `String`                          | `True`   | The Query display description                                                                                      |
| `parameters.[].id`               | `String`                          | `True`   | The Query parameter id                                                                                             |
| `parameters.[].title`            | `String`                          | `True`   | The Query parameter display title                                                                                  |
| `parameters.[].type`             | `String`                          | `True`   | The Query parameter type. This can be *input* for a textbox, or *select* for a select box                          |
| `parameters.[].choices`          | `Key-Value pair <String, String>` | `False`  | The the parameter type is *select*, the choices kvp array contains the choice ID and display values                |
| `parameters.[].value`            | `String`                          | `False`  | The Query default value                                                                                            |
| `predicate.operator`             | `String`                          | `True`   | The Query predicate operation. This can be contains,equals,not,less-than,greater-than,ends-with,starts-with,and,or |
| `predicate.arguments.[].operand` | `String`                          | `True`   | The Query predicates argument operand. This can be *attribute* or *parameter*                                      |
| `predicate.arguments.[].id`      | `String`                          | `True`   | The Query predicates argument id. This is only used with parameter operands                                        |
| `predicate.arguments.[].name`    | `String`                          | `True`   | The Query predicates argument attribute name. This is only used with attribute operands                            |
