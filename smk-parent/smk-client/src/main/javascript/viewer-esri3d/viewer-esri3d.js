include.module( 'viewer-esri3d', [ 'viewer', 'esri3d', 'types-esri3d' ], function () {

    function ViewerEsri3d() {
        SMK.TYPE.ViewerBase.prototype.constructor.apply( this, arguments )
    }

    if ( !SMK.TYPE.Viewer ) SMK.TYPE.Viewer = {}
    SMK.TYPE.Viewer.esri3d = ViewerEsri3d

    $.extend( ViewerEsri3d.prototype, SMK.TYPE.ViewerBase.prototype )

    ViewerEsri3d.prototype.initialize = function ( smk ) {
        var self = this

        var promise = SMK.TYPE.ViewerBase.prototype.initialize.apply( this, arguments )

        var el = smk.addToContainer( '<div class="smk-viewer">' )

        var E = SMK.TYPE.Esri3d

        var layerExtras = []

        var map = new E.Map( {
            basemap: "topo",
            ground: "world-elevation"
        } )

                // if ( smk.viewer ) {
        //     if ( smk.viewer.initialExtent ) {
                var bx = smk.viewer.initialExtent
        //         this.map.fitBounds( [ [ bx[ 1 ], bx[ 0 ] ], [ bx[ 3 ], bx[ 2 ] ] ] );
        //     }

        //     if ( smk.viewer.baseMap )
        //         this.setBasemap( smk.viewer.baseMap )
        // }

        var view = new E.viewsSceneView( {
            container: el,
            map: map,
            // zoom: 6,
            // center: [-124.65, 54.23]
            extent: new E.geometryExtent( {
                xmin: bx[ 1 ], 
                ymin: bx[ 0 ], 
                xmax: bx[ 3 ], 
                ymax: bx[ 2 ]                
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



        // var el = smk.addToContainer( '<div class="smk-viewer">' )

        // this.map = L.map( el, {
        //     dragging:       false,
        //     zoomControl:    false,
        //     boxZoom:        false,
        //     doubleClickZoom:false
        // } )

        // this.map.scrollWheelZoom.disable()

        // // var southWest = L.latLng(47.294133725, -113.291015625),
        // //     northEast = L.latLng(61.1326289908, -141.064453125),
        // //     bounds = L.latLngBounds(southWest, northEast);
        // // this.map.fitBounds(bounds);


        // if ( smk.viewer ) {
        //     if ( smk.viewer.initialExtent ) {
        //         var bx = smk.viewer.initialExtent
        //         this.map.fitBounds( [ [ bx[ 1 ], bx[ 0 ] ], [ bx[ 3 ], bx[ 2 ] ] ] );
        //     }

        //     if ( smk.viewer.baseMap )
        //         this.setBasemap( smk.viewer.baseMap )
        // }

        // this.map.on( 'zoomstart', changedView )
        // this.map.on( 'movestart', changedView )

        // this.changedView( this.getView() )

        // function changedView() {
        //     self.changedView( self.getView() )

        //     Object.keys( self.layerStatus ).forEach( function ( id ) { self.layerStatus[ id ] = 'load' } )

        //     self.startedLoading()
        // }

        // this.loadEvent = {
        //     load: function ( ev ) {
        //         self.layerStatus[ ev.target._smk_id ] = 'ready'

        //         // console.log( 'load', JSON.stringify( self.layerStatus, null, ' ' ) )

        //         if ( Object.values( self.layerStatus ).every( function ( v ) { return v != 'load' } ) )
        //             self.finishedLoading()
        //     }
        // }

        // this.finishedLoading( function () {
        //     self.map.eachLayer( function ( ly ) {
        //         if ( !ly._smk_id ) return

        //         if ( self.layerStatus[ ly._smk_id ] == 'dead' ) {
        //             self.map.removeLayer( ly )
        //             delete self.layerStatus[ ly._smk_id ]
        //             delete self.visibleLayer[ ly._smk_id ]
        //             // console.log( 'remove', ly._smk_id )
        //         }
        //     } )

        //     Object.keys( self.layerStatus ).forEach( function ( id ) {
        //         if ( self.layerStatus[ id ] == 'dead' ) {
        //             delete self.layerStatus[ id ]
        //             delete self.visibleLayer[ id ]
        //         }
        //     } )
        // } )

        return promise
    }

    ViewerEsri3d.prototype.getView = function () {
        return {
            center: this.map.getCenter(),
            zoom: this.map.getZoom()
        }
    }

    ViewerEsri3d.prototype.setBasemap = function ( basemapName ) {
        if( this.currentBasemap ) {
            if ( this.currentBasemap.features )
                this.map.removeLayer( this.currentBasemap.features );

            if ( this.currentBasemap.labels )
                this.map.removeLayer( this.currentBasemap.labels );
        }

        this.currentBasemap = this.createBasemapLayer( basemapName );

        this.map.addLayer( this.currentBasemap.features );
        this.currentBasemap.features.bringToBack();

        if ( this.currentBasemap.labels )
            this.map.addLayer( this.currentBasemap.labels );

        this.changedBaseMap( { baseMap: basemapName } )
    }

    ViewerEsri3d.prototype.setLayersVisible = function ( layerIds, visible ) {
        var self = this

        var layerCount = this.layerIds.length
        if ( layerCount == 0 ) return

        if ( layerIds.every( function ( id ) { return !self.layerId[ id ].visible == !visible } ) ) return

        Object.keys( self.layerStatus ).forEach( function ( id ) {
            self.layerStatus[ id ] = 'pending'
        } )

        this.startedLoading()

        layerIds.forEach( function ( id ) { self.layerId[ id ].visible = !!visible } )

        var visibleLayers = []
        var merged
        this.layerIds.forEach( function ( id, i ) {
            if ( !self.layerId[ id ].visible ) return

            ly = self.layerId[ id ]
            if ( !merged ) {
                merged = [ ly ]
                return
            }

            if ( merged[ 0 ].canMergeWith( ly ) ) {
            // if ( self.canMergeLayers( merged[ 0 ], ly ) ) {
                merged.push( ly )
                return
            }

            visibleLayers.push( merged )
            merged = [ ly ]
        } )
        if ( merged )
            visibleLayers.push( merged )

        var promises = []
        visibleLayers.forEach( function ( lys, i ) {
            var cid = lys.map( function ( ly ) { return ly.config.id } ).join( '--' )

            if ( self.visibleLayer[ cid ] ) {
                self.layerStatus[ cid ] = 'ready'
                return
            }

            self.layerStatus[ cid ] = 'load'

            // var p = self.createLayer( cid, lys.map( function ( m ) { return m } ), layerCount - i )
            var p = self.createLayer( cid, lys.map( function ( m ) { return m } ), layerCount - i )
                .then( function ( ly ) {
                    // console.log( 'visible',cid )
                    ly.off( self.loadEvent )
                    ly.on( self.loadEvent )
                    self.map.addLayer( ly )
                    self.visibleLayer[ cid ] = ly
                    return ly
                } )

            promises.push( p )
        } )

        Object.keys( self.layerStatus ).forEach( function ( id ) {
            if ( self.layerStatus[ id ] == 'pending' )
                self.layerStatus[ id ] = 'dead'
        } )

        if ( promises.length == 0 )
            self.finishedLoading()

        return SMK.UTIL.waitAll( promises )
    }

    ViewerEsri3d.prototype.createLayer = function ( id, layers, zIndex ) {
        return SMK.TYPE.ViewerBase.prototype.createLayer.call( this, id, layers, zIndex, function ( type ) {
            if ( SMK.TYPE.Layer[ type ].esri3d.create )
                return SMK.TYPE.Layer[ type ].esri3d.create.call( this, layers, zIndex )
        } )
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

