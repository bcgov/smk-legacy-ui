exports.gen = function () {
    var tg = require( './lib/tag-gen' )

    var baseDir = 'src/main/javascript'

    var t = new tg.TagSet()

    t.script( 'jquery', 'lib/jquery-3.3.1.min.js' )
    t.script( 'vue', 'lib/vue-2.5.11.js' )
    t.script( 'vue-config', 'smk/vue-config.js' )
    t.script( 'turf', 'https://npmcdn.com/@turf/turf/turf.min.js' )

    t.script( 'util', 'smk/util.js' )
    t.script( 'event', 'smk/event.js' )
    t.script( 'viewer', 'smk/viewer.js' )
    t.script( 'tool', 'smk/tool.js' )
    t.script( 'feature-set', 'smk/feature-set.js' )

    t.group( 'smk-map' )
        .script( 'smk/smk-map.js' )
        .style( 'smk/smk-map-frame.css' )

    t.group( 'layer' )
        .dir( 'smk/layer/**/*', { cwd: baseDir } )

    t.group( 'query' )
        .dir( 'smk/query/**/*', { cwd: baseDir } )

    t.group( 'surround' )
        .dir( 'smk/surround/**/*', { cwd: baseDir } )

    t.style( 'material-icons', 'https://fonts.googleapis.com/icon?family=Material+Icons' )

    t.group( 'toolbar' )
        .dir( 'smk/toolbar/**/*', { cwd: baseDir } )
        .tag( 'material-icons' )

    t.group( 'sidepanel' )
        .dir( 'smk/sidepanel/**/*', { cwd: baseDir } )
        .tag( 'material-icons' )

    t.group( 'widgets' )
        .dir( 'smk/widgets/**/*', { cwd: baseDir } )

    t.group( 'menu' )
        .dir( 'smk/menu/**/*', { cwd: baseDir } )

    t.group( 'feature-list' )
        .dir( 'smk/feature-list/**/*', { cwd: baseDir } )

    t.group( 'tool-menu' )
        .dir( 'smk/tool/menu/**/*', { cwd: baseDir } )

    t.group( 'tool-about' )
        .dir( 'smk/tool/about/**/*', { cwd: baseDir } )

    t.group( 'tool-baseMaps' )
        .dir( 'smk/tool/baseMaps/**/*', { cwd: baseDir } )

    t.group( 'tool-coordinate' )
        .dir( 'smk/tool/coordinate/**/*', { cwd: baseDir } )

    t.group( 'check-directions' )
        .script( '//cdn.jsdelivr.net/npm/sortablejs@1.7.0/Sortable.min.js' )
        .script( '//cdnjs.cloudflare.com/ajax/libs/Vue.Draggable/2.16.0/vuedraggable.min.js' )

    t.group( 'tool-directions' )
        .dir( 'smk/tool/directions/**/*', { cwd: baseDir } )

    t.group( 'tool-dropdown' )
        .dir( 'smk/tool/dropdown/**/*', { cwd: baseDir } )

    t.group( 'tool-layers' )
        .dir( 'smk/tool/layers/**/*', { cwd: baseDir } )

    t.group( 'tool-location' )
        .dir( 'smk/tool/location/**/*', { cwd: baseDir } )

    t.group( 'tool-identify' )
        .dir( 'smk/tool/identify/**/*', { cwd: baseDir } )

    t.group( 'tool-markup' )
        .dir( 'smk/tool/markup/**/*', { cwd: baseDir } )

    t.group( 'tool-measure' )
        .dir( 'smk/tool/measure/**/*', { cwd: baseDir } )

    t.group( 'tool-minimap' )
        .dir( 'smk/tool/minimap/**/*', { cwd: baseDir } )

    t.group( 'tool-pan' )
        .dir( 'smk/tool/pan/**/*', { cwd: baseDir } )

    t.group( 'tool-queries' )
        .dir( 'smk/tool/queries/**/*', { cwd: baseDir } )

    t.group( 'tool-query' )
        .dir( 'smk/tool/query/**/*', { cwd: baseDir } )

    t.group( 'tool-scale' )
        .dir( 'smk/tool/scale/**/*', { cwd: baseDir } )

    t.group( 'tool-search' )
        .dir( 'smk/tool/search/**/*', { cwd: baseDir } )

    t.group( 'tool-select' )
        .dir( 'smk/tool/select/**/*', { cwd: baseDir } )

    t.group( 'tool-zoom' )
        .dir( 'smk/tool/zoom/**/*', { cwd: baseDir } )

    // leaflet

    t.group( 'tool-pan-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/pan/**/*', { cwd: baseDir } )

    t.group( 'tool-zoom-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/zoom/**/*', { cwd: baseDir } )

    t.group( 'tool-measure-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/measure/**/*', { cwd: baseDir } )

    t.group( 'tool-scale-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/scale/**/*', { cwd: baseDir } )

    t.group( 'tool-coordinate-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/coordinate/**/*', { cwd: baseDir } )

    t.group( 'tool-directions-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/directions/**/*', { cwd: baseDir } )

    t.group( 'tool-location-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/location/**/*', { cwd: baseDir } )

    t.group( 'tool-minimap-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/minimap/**/*', { cwd: baseDir } )

    t.sequence( 'tool-markup-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/markup/**/*', { cwd: baseDir } )
        .style( 'https://unpkg.com/leaflet.pm@0.17.3/dist/leaflet.pm.css' )
        .script( 'https://unpkg.com/leaflet.pm@0.17.3/dist/leaflet.pm.min.js' )

    t.group( 'tool-queries-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/queries/**/*', { cwd: baseDir } )

    t.group( 'tool-query-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/query/**/*', { cwd: baseDir } )

    t.group( 'tool-identify-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/identify/**/*', { cwd: baseDir } )

    t.group( 'tool-select-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/select/**/*', { cwd: baseDir } )

    t.group( 'tool-search-leaflet' )
        .dir( 'smk/viewer-leaflet/tool/search/**/*', { cwd: baseDir } )

    t.group( 'layer-leaflet' )
        .dir( 'smk/viewer-leaflet/layer/**/*', { cwd: baseDir } )

    t.script( 'feature-list-leaflet', 'smk/viewer-leaflet/feature-list-leaflet.js' )
    t.script( 'feature-list-clustering-leaflet', 'smk/viewer-leaflet/feature-list-clustering-leaflet.js' )

    t.group( 'viewer-leaflet' )
        .script( 'smk/viewer-leaflet/viewer-leaflet.js' )
        .style( 'smk/viewer-leaflet/viewer-leaflet.css' )

    t.sequence( 'leaflet' )
        .script( 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.js', { 'integrity': 'sha512-lInM/apFSqyy1o6s89K4iQUKg6ppXEgsVxT35HbzUupEVRh2Eu9Wdl4tHj7dZO0s1uvplcYGmt3498TtHq+log==' } )
        .style( 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.css', { 'integrity': 'sha512-M2wvCLH6DSRazYeZRIm1JnYyh22purTM+FDB5CsyxtQJYeKq83arPe5wgbNmcFXGqiSH2XR8dT/fJISVA1r/zQ==' } )
        .script( 'https://unpkg.com/esri-leaflet@2.1.0/dist/esri-leaflet.js', { 'integrity': 'sha512-Tojl3UMd387f6DdAJlo+fKfJZiP55fYT+6Y58yKbHydnueOdSFOxrgLPuUxm7VW1szEt3hZVwv3V2sSUCuT35w==' } )

    t.sequence( 'leaflet-extensions' )
        .tag( 'leaflet' )
        .script( 'lib/NonTiledLayer-src.js' )
        .script( 'https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js' )
        .script( 'https://unpkg.com/terraformer@1.0.7' )
        .script( 'https://unpkg.com/terraformer-arcgis-parser@1.0.5' )
        .script( 'https://unpkg.com/terraformer-wkt-parser@1.1.2' )
    	.style( "https://unpkg.com/leaflet.markercluster@1.0.6/dist/MarkerCluster.css" )
    	.style( "https://unpkg.com/leaflet.markercluster@1.0.6/dist/MarkerCluster.Default.css" )
    	.script( "https://unpkg.com/leaflet.markercluster@1.0.6/dist/leaflet.markercluster-src.js" )
    	.script( "lib/leaflet-heat.js" )

    // esri3d

    t.group( 'tool-coordinate-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/coordinate/**/*', { cwd: baseDir } )

    t.group( 'tool-directions-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/directions/**/*', { cwd: baseDir } )

    t.group( 'tool-identify-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/identify/**/*', { cwd: baseDir } )

    t.group( 'tool-markup-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/markup/**/*', { cwd: baseDir } )

    t.group( 'tool-location-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/location/**/*', { cwd: baseDir } )

    t.group( 'tool-measure-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/measure/**/*', { cwd: baseDir } )

    t.group( 'tool-minimap-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/minimap/**/*', { cwd: baseDir } )

    t.group( 'tool-pan-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/pan/**/*', { cwd: baseDir } )

    t.group( 'tool-query-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/query/**/*', { cwd: baseDir } )

    t.group( 'tool-scale-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/scale/**/*', { cwd: baseDir } )

    t.group( 'tool-search-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/search/**/*', { cwd: baseDir } )

    t.group( 'tool-select-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/select/**/*', { cwd: baseDir } )

    t.group( 'tool-zoom-esri3d' )
        .dir( 'smk/viewer-esri3d/tool/zoom/**/*', { cwd: baseDir } )

    t.group( 'layer-esri3d' )
        .dir( 'smk/viewer-esri3d/layer/**/*', { cwd: baseDir } )

    t.script( 'types-esri3d', 'smk/viewer-esri3d/types-esri3d.js' )

    t.script( 'util-esri3d', 'smk/viewer-esri3d/util-esri3d.js' )

    t.group( 'viewer-esri3d' )
        .script( 'smk/viewer-esri3d/viewer-esri3d.js' )
        .style( 'smk/viewer-esri3d/viewer-esri3d.css' )

    t.script( 'feature-list-esri3d', 'smk/viewer-esri3d/feature-list-esri3d.js' )

    t.sequence( 'esri3d' )
        .tag( 'leaflet' )
        .style( 'https://js.arcgis.com/4.7/esri/css/main.css' )
        .script( 'https://js.arcgis.com/4.7/' )
        .script( 'lib/toGeoJSON.js' )
        .script( 'https://unpkg.com/terraformer@1.0.7' )
        .script( 'https://unpkg.com/terraformer-arcgis-parser@1.0.5' )
        .script( 'https://unpkg.com/terraformer-wkt-parser@1.1.2' )

    t.sequence( 'proj4' )
        .script( 'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.4.4/proj4.js' )
        .script( 'smk/projections.js' )

    return t
}
