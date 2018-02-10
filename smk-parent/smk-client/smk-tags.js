// var fs = require( 'fs' )

// process.stdout.setEncoding( 'utf8' )
// process.stdout.write( tags().stringify() )

exports.gen = function () {
    var tg = require( './lib/tag-gen' )

    var t = new tg.TagSet()

    t.script( "jquery", "lib/jquery-1.11.2.js" )
    t.script( "vue", "lib/vue-2.5.11.js" )

    t.script( "smk", "smk.js" )
    t.script( "util", "util.js" )
    t.script( "event", "event.js" )
    t.script( "smk-map", "smk-map.js" )
    t.script( "viewer", "viewer.js" )
    t.script( "layer", "layer.js" )
    t.script( "feature-set", "feature-set.js" )

    t.sequence( "map-frame-styles" )
        .script( "resources/css/smk-map-frame.css" )
        .script( "resources/css/materialize.css" )
        .script( "resources/css/fonts.css" )
        .style( "https://fonts.googleapis.com/icon?family=Material+Icons" )
        .script( "resources/css/dmf.css" )

    t.template( "surround-header", "resources/template/header.html" )

    t.group( "surround" )
        .style( "resources/css/smk-standalone.css" )
        .tag( "surround-header" )

        // tools

        // "tool-measure" : { "loader": "group", "tags": [
        //     { "url": "tool/measure.js" }
        // ] },
        // "tool-scale" : { "loader": "group", "tags": [
        //     { "url": "tool/scale.js" }
        // ] },
        // "tool-scaleFactor" : { "loader": "group", "tags": [
        //     { "url": "tool/scaleFactor.js" }
        // ] },
        // "tool-coordinate" : { "loader": "group", "tags": [
        //     { "url": "tool/coordinate.js" }
        // ] },
        // "tool-minimap" : { "loader": "group", "tags": [
        //     { "url": "tool/minimap.js" }
        // ] },
        // "tool-markup" : { "loader": "group", "tags": [
        //     { "url": "tool/markup.js" }
        // ] },
        // "tool-directions" : { "loader": "group", "tags": [
        //     { "url": "tool/directions.js" }
        // ] },
        // "tool-pan" : { "loader": "group", "tags": [
        //     { "url": "tool/pan.js" }
        // ] },
        // "tool-zoom" : { "loader": "group", "tags": [
        //     { "url": "tool/zoom.js" }
        // ] },
    t.group( "tool-about" )
        .script( "tool/about.js" )

    t.group( "tool-baseMaps" )
        .script( "tool/baseMaps.js" )

    t.group( "tool-layers" )
        .script( "tool/layers.js" )

    t.group( "tool-identify" )
        .script( "tool/identify.js" )

    t.group( "tool-select" )
        .script( "tool/select.js" )


    // leaflet

    t.group( "tool-measure-leaflet" )
        .style( "resources/css/leaflet-measure.css" )
        .script( "resources/js/leaflet-measure.min.js" )
        .script( "leaflet/tool/measure.js" )

    t.group( "tool-scale-leaflet" )
        .style( "resources/css/L.Control.BetterScale.css" )
        .script( "resources/js/L.Control.BetterScale.js" )
        .script( "leaflet/tool/scale.js" )

    t.group( "tool-scaleFactor-leaflet" )
        .style( "resources/css/leaflet.scalefactor.min.css" )
        .script( "resources/js/leaflet.scalefactor.min.js" )
        .script( "leaflet/tool/scaleFactor.js" )

    t.group( "tool-coordinate-leaflet" )
        .style( "resources/css/L.Control.Coordinates.css" )
        .script( "resources/js/L.Control.Coordinates.js" )
        .script( "leaflet/tool/coordinate.js" )

    t.group( "tool-minimap-leaflet" )
        .style( "resources/css/Control.MiniMap.min.css" )
        .script( "resources/js/Control.MiniMap.min.js" )
        .script( "leaflet/tool/minimap.js" )

    t.group( "tool-markup-leaflet" )
        .style( "https://unpkg.com/leaflet.pm@0.17.3/dist/leaflet.pm.css" )
        .script( "https://unpkg.com/leaflet.pm@0.17.3/dist/leaflet.pm.min.js" )
        .script( "leaflet/tool/markup.js" )

    // "tool-directions-leaflet" : { "loader": "group", "tags": [
    //     { "url": "leaflet/tool/directions.js" }
    // ] },
    // "tool-pan-leaflet" : { "loader": "group", "tags": [
    //     { "url": "leaflet/tool/pan.js" }
    // ] },
    // "tool-zoom-leaflet" : { "loader": "group", "tags": [
    //     { "url": "leaflet/tool/zoom.js" }
    // ] },
    // "tool-about-leaflet" : { "loader": "group", "tags": [
    //     { "url": "leaflet/tool/about.js" }
    // ] },
    // "tool-baseMaps-leaflet" : { "loader": "group", "tags": [
    //     { "url": "leaflet/tool/baseMaps.js" }
    // ] },
    // "tool-layers-leaflet" : { "loader": "group", "tags": [
    //     { "url": "leaflet/tool/layers.js" }
    // ] },
    t.group( "tool-identify-leaflet" )
        .script( "leaflet/tool/identify.js" )

    t.group( "tool-select-leaflet" )
        .script( "leaflet/tool/select.js" )


    t.script( "layer-leaflet", "leaflet/layer.js" )

    t.group( "viewer-leaflet" )
        .script( "leaflet/viewer.js" )
        .tag( "layer-leaflet" )

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

    t.script( "sidebar", "sidebar.js" )
    t.template( "sidebar-panels", "resources/template/sidebar.html" )
    t.template( "sidebar-button", "resources/template/sidebar-button.html" )
    t.template( "side-panel", "resources/template/side-panel.html" )

    t.template( "about-panel", "resources/template/about-panel.html" )

    t.template( "base-maps-panel", "resources/template/base-maps-panel.html" )

    t.template( "layers-panel", "resources/template/layers-panel.html" )

    t.template( "identify-panel", "resources/template/identify-panel.html" )
    t.template( "sidebar-identify", "resources/template/identify-popup.html" )

    t.template( "select-panel", "resources/template/select-panel.html" )

    return t
}
    // process.stdout.write( JSON.stringify( t, null, '  ' ) )
