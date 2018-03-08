exports.gen = function () {
    var tg = require( './lib/tag-gen' )

    var baseDir = 'src/main/javascript'

    var t = new tg.TagSet()

    t.script( "jquery", "lib/jquery-1.11.2.js" )
    t.script( "vue", "lib/vue-2.5.11.js" )

    t.script( "smk", "smk.js" )
    t.script( "util", "util.js" )
    t.script( "event", "event.js" )
    t.script( "smk-map", "smk-map.js" )
    t.script( "viewer", "viewer.js" )
    t.script( "layer", "layer.js" )
    t.script( "tool", "tool.js" )
    t.script( "feature-set", "feature-set.js" )

    t.sequence( "map-frame-styles" )
        .style( "resources/css/smk-map-frame.css" )
<<<<<<< HEAD
        .style( "resources/css/materialize.css" )
        .style( "resources/css/fonts.css" )
        .style( "https://fonts.googleapis.com/icon?family=Material+Icons" )
        .style( "resources/css/dmf.css" )
=======
        .style( "https://fonts.googleapis.com/icon?family=Material+Icons" )
>>>>>>> master

    t.group( "surround" )
        .dir( 'surround/**/*', { cwd: baseDir } )

    t.group( 'toolbar' )
        .dir( 'toolbar/**/*', { cwd: baseDir } )

    t.group( 'sidepanel' )
        .dir( 'sidepanel/**/*', { cwd: baseDir } )

    t.group( 'widgets' )
        .dir( 'widgets/**/*', { cwd: baseDir } )

    t.group( "menu" )
        .dir( 'menu/**/*', { cwd: baseDir } )

<<<<<<< HEAD
    // t.group( 'tool-bar' )
    //     .script( "sidebar.js" )
    //     .template( "sidebar-panels", "template/sidebar.html" )
    //     .template( "sidebar-button", "template/sidebar-button.html" )
    //     .template( "side-panel", "template/side-panel.html" )

=======
>>>>>>> master

    t.group( "tool-menu" )
        .dir( 'tool-menu/**/*', { cwd: baseDir } )

    t.group( "tool-about" )
        .dir( 'tool-about/**/*', { cwd: baseDir } )

    t.group( "tool-baseMaps" )
        .dir( 'tool-baseMaps/**/*', { cwd: baseDir } )

    t.group( "tool-coordinate" )
        .dir( 'tool-coordinate/**/*', { cwd: baseDir } )

    t.group( "tool-layers" )
        .dir( 'tool-layers/**/*', { cwd: baseDir } )

    t.group( "tool-identify" )
        .dir( 'tool-identify/**/*', { cwd: baseDir } )

    t.group( "tool-markup" )
        .dir( 'tool-markup/**/*', { cwd: baseDir } )

    t.group( "tool-measure" )
        .dir( 'tool-measure/**/*', { cwd: baseDir } )

    t.group( "tool-minimap" )
        .dir( 'tool-minimap/**/*', { cwd: baseDir } )

    t.group( "tool-pan" )
        .dir( 'tool-pan/**/*', { cwd: baseDir } )

    t.group( "tool-scale" )
        .dir( 'tool-scale/**/*', { cwd: baseDir } )

    t.group( "tool-search" )
        .dir( 'tool-search/**/*', { cwd: baseDir } )

    t.group( "tool-select" )
        .dir( 'tool-select/**/*', { cwd: baseDir } )

    t.group( "tool-zoom" )
        .dir( 'tool-zoom/**/*', { cwd: baseDir } )

    // leaflet

    t.group( "tool-pan-leaflet" )
        .dir( 'viewer-leaflet/tool-pan/**/*', { cwd: baseDir } )

    t.group( "tool-zoom-leaflet" )
        .dir( 'viewer-leaflet/tool-zoom/**/*', { cwd: baseDir } )

    t.group( "tool-measure-leaflet" )
        .dir( 'viewer-leaflet/tool-measure/**/*', { cwd: baseDir } )

    t.group( "tool-scale-leaflet" )
        .dir( 'viewer-leaflet/tool-scale/**/*', { cwd: baseDir } )

    t.group( "tool-coordinate-leaflet" )
        .dir( 'viewer-leaflet/tool-coordinate/**/*', { cwd: baseDir } )

    t.group( "tool-minimap-leaflet" )
        .dir( 'viewer-leaflet/tool-minimap/**/*', { cwd: baseDir } )

    t.group( "tool-markup-leaflet" )
        .dir( 'viewer-leaflet/tool-markup/**/*', { cwd: baseDir } )
        .style( "https://unpkg.com/leaflet.pm@0.17.3/dist/leaflet.pm.css" )
        .script( "https://unpkg.com/leaflet.pm@0.17.3/dist/leaflet.pm.min.js" )

    t.group( "tool-identify-leaflet" )
        .dir( "viewer-leaflet/tool-identify/**/*", { cwd: baseDir } )

    t.group( "tool-select-leaflet" )
        .dir( "viewer-leaflet/tool-select/**/*", { cwd: baseDir } )

    t.group( "tool-search-leaflet" )
        .dir( "viewer-leaflet/tool-search/**/*", { cwd: baseDir } )

    t.script( "layer-leaflet", "viewer-leaflet/layer-leaflet.js" )

    t.group( "viewer-leaflet" )
        .script( "viewer-leaflet/viewer-leaflet.js" )
        .tag( "layer-leaflet" )
<<<<<<< HEAD
=======
        .style( "viewer-leaflet/viewer-leaflet.css" )
>>>>>>> master

    t.sequence( "leaflet" )
        .script( "https://unpkg.com/leaflet@1.2.0/dist/leaflet.js", { "integrity": "sha512-lInM/apFSqyy1o6s89K4iQUKg6ppXEgsVxT35HbzUupEVRh2Eu9Wdl4tHj7dZO0s1uvplcYGmt3498TtHq+log==" } )
        .style( "https://unpkg.com/leaflet@1.2.0/dist/leaflet.css", { "integrity": "sha512-M2wvCLH6DSRazYeZRIm1JnYyh22purTM+FDB5CsyxtQJYeKq83arPe5wgbNmcFXGqiSH2XR8dT/fJISVA1r/zQ==" } )
        .script( "https://unpkg.com/esri-leaflet@2.1.0/dist/esri-leaflet.js", { "integrity": "sha512-Tojl3UMd387f6DdAJlo+fKfJZiP55fYT+6Y58yKbHydnueOdSFOxrgLPuUxm7VW1szEt3hZVwv3V2sSUCuT35w==" } )
        .script( "resources/js/NonTiledLayer-src.js" )
        .script( "https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js" )
        .script( "https://unpkg.com/terraformer@1.0.7" )
        .script( "https://unpkg.com/terraformer-arcgis-parser@1.0.5" )
        .script( "https://unpkg.com/terraformer-wkt-parser@1.1.2" )
        .script( "https://npmcdn.com/@turf/turf/turf.min.js" )

    return t
}
