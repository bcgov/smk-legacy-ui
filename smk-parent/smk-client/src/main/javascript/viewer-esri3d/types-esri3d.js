include.module( 'types-esri3d', [ 'smk', 'esri3d' ], function () {

    return new Promise( function ( res ) {
        var objs = [
        // require( [
            "esri/config",
            "esri/Map",
            "esri/views/SceneView",
            "esri/geometry/SpatialReference",
            "esri/geometry/geometryEngine",

            // widgets
            "esri/widgets/Expand",
            "esri/widgets/BasemapGallery",
            "esri/widgets/Legend",
            "esri/widgets/Home",
            "esri/widgets/LayerList",
            "esri/widgets/Search",

            // layers and rendering
            "esri/layers/MapImageLayer",
            "esri/layers/WMSLayer",
            "esri/renderers/SimpleRenderer",
            "esri/renderers/UniqueValueRenderer",
            "esri/renderers/ClassBreaksRenderer",

            // Symbols & Geometry
            "esri/Graphic",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol",
            "esri/geometry/Point",
            "esri/geometry/Polyline",
            "esri/geometry/Polygon",
            "esri/geometry/Extent",

            // dojo stuff
            // "dojo/domReady!"
        ]
        
        SMK.TYPE.Esri3d = {}
        require( objs, function () {
            var args = [].slice.call( arguments )
            objs.forEach( function ( o, i ) {
                SMK.TYPE.Esri3d[ o.replace( 'esri/', '' ).replace( '/', '' ) ] = args[ i ]
            } )
            res()            
        } )
        // ], function (   esriConfig, Map, SceneView, SpatialReference, geometryEngine,
        //                 Expand, BasemapGallery, Legend, Home, LayerList, Search,
        //                 MapImageLayer, WMSLayer, SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer,
        //                 Graphic, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Point, Polyline, Polygon ) {

        //     SMK.TYPE.Esri3d = {}
        //     SMK.TYPE.Esri3d.esriConfig          = esriConfig
        //     SMK.TYPE.Esri3d.Map                 = Map
        //     SMK.TYPE.Esri3d.SceneView           = SceneView
        //     SMK.TYPE.Esri3d.SpatialReference    = SpatialReference
        //     SMK.TYPE.Esri3d.geometryEngine      = geometryEngine
        //     SMK.TYPE.Esri3d.Expand              = Expand
        //     SMK.TYPE.Esri3d.BasemapGallery      = BasemapGallery
        //     SMK.TYPE.Esri3d.Legend              = Legend
        //     SMK.TYPE.Esri3d.Home                = Home
        //     SMK.TYPE.Esri3d.LayerList           = LayerList
        //     SMK.TYPE.Esri3d.Search              = Search
        //     SMK.TYPE.Esri3d.MapImageLayer       = MapImageLayer
        //     SMK.TYPE.Esri3d.WMSLayer            = WMSLayer
        //     SMK.TYPE.Esri3d.SimpleRenderer      = SimpleRenderer
        //     SMK.TYPE.Esri3d.UniqueValueRenderer = UniqueValueRenderer
        //     SMK.TYPE.Esri3d.ClassBreaksRenderer = ClassBreaksRenderer
        //     SMK.TYPE.Esri3d.Graphic             = Graphic
        //     SMK.TYPE.Esri3d.SimpleMarkerSymbol  = SimpleMarkerSymbol
        //     SMK.TYPE.Esri3d.SimpleLineSymbol    = SimpleLineSymbol
        //     SMK.TYPE.Esri3d.SimpleFillSymbol    = SimpleFillSymbol
        //     SMK.TYPE.Esri3d.Point               = Point
        //     SMK.TYPE.Esri3d.Polyline            = Polyline
        //     SMK.TYPE.Esri3d.Polygon             = Polygon

        //     res()
        // } )
    } )
} )