include.module( 'viewer-esri3d', [ 'viewer', 'esri3d', 'types-esri3d', 'layer-esri3d' ], function () {

    var E = SMK.TYPE.Esri3d

    function ViewerEsri3d() {
        SMK.TYPE.Viewer.prototype.constructor.apply( this, arguments )
    }

    if ( !SMK.TYPE.Viewer ) SMK.TYPE.Viewer = {}
    SMK.TYPE.Viewer.esri3d = ViewerEsri3d

    $.extend( ViewerEsri3d.prototype, SMK.TYPE.Viewer.prototype )
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

        SMK.TYPE.Viewer.prototype.initialize.apply( this, arguments )

        var el = smk.addToContainer( '<div class="smk-viewer">' )

        var layerExtras = []

        this.map = new E.Map( {
            basemap: this.basemap[ smk.viewer.baseMap ].esri3d || 'topo',
            ground: "world-elevation"
        } )

        var bx = smk.viewer.location.extent

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
            self.changedView()
        } )

        E.core.watchUtils.whenFalse( this.view, "stationary", function() {
            self.changedView()
        } )

        this.changedView()

        self.finishedLoading( function () {
            self.map.layers.forEach( function ( ly ) {
                if ( !ly || !ly._smk_id ) return

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

        this.view.on( 'click', function ( ev ) {
            self.pickedLocation( {
                map:    ev.mapPoint,
                screen: { x: ev.x, y: ev.y }
            } )
        } )

    }

    ViewerEsri3d.prototype.getView = function () {
        if ( !this.view.center ) return

        var ex = E.geometry.support.webMercatorUtils.webMercatorToGeographic( this.view.extent )

        return {
            center: this.view.center,
            zoom: this.view.zoom,
            extent: [ ex.xmin, ex.ymin, ex.xmax, ex.ymax ],
            screen: {
                width:  this.view.width,
                height: this.view.height
            }
            // scale: mapDist / this.screenpixelsToMeters,
            // metersPerPixel: mapDist / 100,
        }
    }

    ViewerEsri3d.prototype.setBasemap = function ( basemapId ) {
        this.map.basemap = this.basemap[ basemapId ].esri3d

        this.changedBaseMap( { baseMap: basemapId } )
    }

    ViewerEsri3d.prototype.addViewerLayer = function ( viewerLayer ) {
        this.map.add( viewerLayer )
    }

    ViewerEsri3d.prototype.positionViewerLayer = function ( viewerLayer, zOrder ) {
        // console.log( viewerLayer._smk_id, zOrder )
        this.map.reorder( viewerLayer, zOrder )
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

    ViewerEsri3d.prototype.showPopup = function ( contentEl, location, option ) {
        if ( location == null )
            location = this.popupLocation
        else
            this.popupLocation = location

        this.view.popup.actions = []
        this.view.popup.dockOptions = { buttonEnabled: false }
        this.view.popup.open( Object.assign( {
            content: contentEl,
            location: { type: 'point', latitude: location.latitude, longitude: location.longitude }
        }, option ) )
    }
} )

