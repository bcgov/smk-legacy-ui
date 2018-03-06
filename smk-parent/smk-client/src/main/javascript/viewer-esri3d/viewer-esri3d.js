include.module( 'viewer-esri3d', [ 'viewer', 'esri3d', 'types-esri3d' ], function () {

    var E = SMK.TYPE.Esri3d

    function ViewerEsri3d() {
        SMK.TYPE.ViewerBase.prototype.constructor.apply( this, arguments )
    }

    if ( !SMK.TYPE.Viewer ) SMK.TYPE.Viewer = {}
    SMK.TYPE.Viewer.esri3d = ViewerEsri3d

    $.extend( ViewerEsri3d.prototype, SMK.TYPE.ViewerBase.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerEsri3d.prototype.basemap.Topographic.esri3d = 'topo'
    ViewerEsri3d.prototype.basemap.Streets.esri3d = 'streets'
    ViewerEsri3d.prototype.basemap.Imagery.esri3d = 'satellite'
    ViewerEsri3d.prototype.basemap.Oceans.esri3d = 'oceans'
    ViewerEsri3d.prototype.basemap.NationalGeographic.esri3d = 'national-geographic'
    ViewerEsri3d.prototype.basemap.ShadedRelief.esri3d = 'terrain'
    ViewerEsri3d.prototype.basemap.DarkGray.esri3d = 'dark-gray'
    ViewerEsri3d.prototype.basemap.Gray.esri3d = 'gray'
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerEsri3d.prototype.initialize = function ( smk ) {
        var self = this

        SMK.TYPE.ViewerBase.prototype.initialize.apply( this, arguments )

        var el = smk.addToContainer( '<div class="smk-viewer">' )

        var layerExtras = []

        this.map = new E.Map( {
            basemap: this.basemap[ smk.viewer.baseMap ].esri3d || 'topo',
            ground: "world-elevation"
        } )

        var bx = smk.viewer.initialExtent

        this.view = new E.views.SceneView( {
            container: el,
            map: this.map,
            ui: new E.views.ui.DefaultUI( {
                components: [ "attribution" ],
                padding: {
                    top: 5,
                    left: 5,
                    right: 5,
                    bottom: 5
                }
            } ),
            extent: new E.geometry.Extent( {
                xmin: bx[ 0 ],
                ymin: bx[ 1 ],
                xmax: bx[ 2 ],
                ymax: bx[ 3 ]
            } )

        } )

        // disable panning
        this.panHandler = {
            drag: this.view.on( "drag", function( evt ) {
                evt.stopPropagation()
            } ),
            keyDown: this.view.on( "key-down", function( evt ) {
                if ( /Arrow/.test( evt.key ) )
                    evt.stopPropagation()
            } )
        }

        // disable zooming
        this.zoomHandler = {
            keyDown: this.view.on( "key-down", function( evt ) {
                if ( /^([+-_=]|Shift)$/.test( evt.key ) )
                    evt.stopPropagation()
            } ),
            mouseWheel: this.view.on( "mouse-wheel", function( evt ) {
                evt.stopPropagation()
            } ),
            doubleClick1: this.view.on( "double-click", function( evt ) {
                evt.stopPropagation()
            } ),
            doubleClick2: this.view.on( "double-click", [ "Control" ], function( evt ) {
                evt.stopPropagation()
            } ),
            drag1: this.view.on( "drag", [ "Shift" ], function( evt ) {
                evt.stopPropagation()
            } ),
            drag2: this.view.on( "drag", [ "Shift", "Control" ], function( evt ) {
                evt.stopPropagation()
            } ),
        }

        // Watch view's stationary property for becoming true.
        E.core.watchUtils.whenTrue( this.view, "stationary", function() {
            self.changedView( self.getView() )
        } )

        this.changedView( this.getView() )

        self.finishedLoading( function () {
            self.map.layers.forEach( function ( ly ) {
                if ( !ly._smk_id ) return

                if ( self.deadViewerLayer[ ly._smk_id ] ) {
                    self.map.layers.remove( ly )
                    delete self.visibleLayer[ ly._smk_id ]
                    // console.log( 'remove', ly._smk_id )
                }
            } )

            Object.keys( self.deadViewerLayer ).forEach( function ( id ) {
                delete self.deadViewerLayer[ id ]
                delete self.visibleLayer[ id ]
                // console.log( 'dead', id )
            } )
        } )



        // initViewActions(view);

        // init widgets
        // Home
        // var homeBtn = new E.Home( {
        //     view: view
        // } )

        // view.ui.add( homeBtn, "top-left" )

        // configure an expander ui section for the home page content

        // var homeContentWrapper = "<div id='homeContent' style='padding: 15px; max-width: 600px; height: calc(100vh - 175px); width: calc(100vw - 115px); background-color: rgba(255, 255, 255, 0.8);'>" + $('#homepageDetails').html().toString() + "</div>";
        // $('#homepageDetails').remove()

        // var homeContentExpander = new Expand(
        // {
        //     view: view,
        //     content: homeContentWrapper,
        //     expandIconClass: "esri-icon-drag-horizontal",
        //     expanded: true
        // });

        // view.ui.add(homeContentExpander, "top-right");

        // var basemapGallery = new BasemapGallery(
        // {
        //     view: view,
        //     container: document.createElement("div")
        // });

        // var bgExpand = new Expand(
        // {
        //     view: view,
        //     content: basemapGallery.container,
        //     expandIconClass: "esri-icon-basemap"
        // });

        // view.ui.add(bgExpand, "top-right");

        // // Add the widget to the top-right corner of the view
        // view.ui.add(basemapGallery,
        // {
        //     position: "top-right"
        // });

        // // create legend when view is updated
        // view.then(function()
        // {
        //     // layer list when view is updated
        //     var layerList = new LayerList(
        //     {
        //         view: view,
        //         // executes for each ListItem in the LayerList
        //         listItemCreatedFunction: defineLayerListActions,
        //         container: document.createElement("div")
        //     });

        //     // configure layer list events
        //     layerList.on("trigger-action", function(event)
        //     {
        //         layerListActions(event);
        //     });

        //     // Add widget to the top right corner of the view
        //     var layerExpand = new Expand(
        //     {
        //         view: view,
        //         content: layerList.container,
        //         expandIconClass: "esri-icon-layers"
        //     });

        //     view.ui.add(layerExpand, "top-right");

        //     // configure layerinfos
        //     var layerInfos = [];

        //     for (var lyr in map.layers.items)
        //     {
        //         for (var lyr in lyr.sublayers)
        //         {
        //             layerInfos.push(
        //             {
        //                 layer: lyr,
        //                 title: lyr.title
        //             });
        //         }
        //     }

        //     // add legend
        //     var legend = new Legend(
        //     {
        //         view: view,
        //         container: document.createElement("div"),
        //         layerInfos: layerInfos
        //     });

        //     var legendExpand = new Expand(
        //     {
        //         view: view,
        //         content: legend.container,
        //         expandIconClass: "esri-icon-public"
        //     });

        //     view.ui.add(legendExpand, "top-right");
        // });

        /*var searchWidget = new Search(
        {
            view: view
        });*/

        // Add the search widget to the very top left corner of the view
        /*view.ui.add(searchWidget,
        {
            position: "top-left",
            index: 0
        });*/



    }

    ViewerEsri3d.prototype.getView = function () {
        if ( !this.view.center ) return
        return {
            center: { lat: this.view.center.latitude, lng: this.view.center.longitude },
            zoom: this.view.zoom
        }
    }

    ViewerEsri3d.prototype.setBasemap = function ( basemapId ) {
        this.map.basemap = this.basemap[ basemapId ].esri3d

        this.changedBaseMap( { baseMap: basemapId } )
    }

    ViewerEsri3d.prototype.addViewerLayer = function ( viewerLayer ) {
        this.map.add( viewerLayer )
    }

    ViewerEsri3d.prototype.zoomToFeature = function ( layer, feature ) {
        this.map.fitBounds( feature.highlightLayer.getBounds(), {
            paddingTopLeft: L.point( 300, 100 ),
            animate: false
        } )
    }

    var basemapHasLabels = {
        'ShadedRelief': true,
        'Oceans': true,
        'Gray': true,
        'DarkGray': true,
        'Imagery': true,
        'Terrain': true,
    }

    ViewerEsri3d.prototype.createBasemapLayer = function ( basemapName ) {
        return {
            features: L.esri.basemapLayer( basemapName, { detectRetina: true } ),
            labels: basemapHasLabels[ basemapName ] && L.esri.basemapLayer( basemapName + 'Labels' )
        }
    }

} )

