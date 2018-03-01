include.module( 'viewer-leaflet', [ 'viewer', 'leaflet' ], function () {

    function ViewerLeaflet() {
        SMK.TYPE.ViewerBase.prototype.constructor.apply( this, arguments )
    }

    if ( !SMK.TYPE.Viewer ) SMK.TYPE.Viewer = {}
    SMK.TYPE.Viewer.leaflet = ViewerLeaflet

    $.extend( ViewerLeaflet.prototype, SMK.TYPE.ViewerBase.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerLeaflet.prototype.initialize = function ( smk ) {
        var self = this

        var promise = SMK.TYPE.ViewerBase.prototype.initialize.apply( this, arguments )

        var el = smk.addToContainer( '<div class="smk-viewer">' )

        this.map = L.map( el, {
            dragging:       false,
            zoomControl:    false,
            boxZoom:        false,
            doubleClickZoom:false
        } )

        this.map.scrollWheelZoom.disable()

        // var southWest = L.latLng(47.294133725, -113.291015625),
        //     northEast = L.latLng(61.1326289908, -141.064453125),
        //     bounds = L.latLngBounds(southWest, northEast);
        // this.map.fitBounds(bounds);


        if ( smk.viewer ) {
            if ( smk.viewer.initialExtent ) {
                var bx = smk.viewer.initialExtent
                this.map.fitBounds( [ [ bx[ 1 ], bx[ 0 ] ], [ bx[ 3 ], bx[ 2 ] ] ] );
            }

            if ( smk.viewer.baseMap )
                this.setBasemap( smk.viewer.baseMap )
        }

        this.map.on( 'zoomstart', changedView )
        this.map.on( 'movestart', changedView )

        this.changedView( this.getView() )

        function changedView() {
            self.changedView( self.getView() )

            Object.keys( self.layerStatus ).forEach( function ( id ) { self.layerStatus[ id ] = 'load' } )

            self.startedLoading()
        }

        this.loadEvent = {
            load: function ( ev ) {
                self.layerStatus[ ev.target._smk_id ] = 'ready'

                // console.log( 'load', JSON.stringify( self.layerStatus, null, ' ' ) )

                if ( Object.values( self.layerStatus ).every( function ( v ) { return v != 'load' } ) )
                    self.finishedLoading()
            }
        }

        this.finishedLoading( function () {
            self.map.eachLayer( function ( ly ) {
                if ( !ly._smk_id ) return

                if ( self.layerStatus[ ly._smk_id ] == 'dead' ) {
                    self.map.removeLayer( ly )
                    delete self.layerStatus[ ly._smk_id ]
                    delete self.visibleLayer[ ly._smk_id ]
                    // console.log( 'remove', ly._smk_id )
                }
            } )

            Object.keys( self.layerStatus ).forEach( function ( id ) {
                if ( self.layerStatus[ id ] == 'dead' ) {
                    delete self.layerStatus[ id ]
                    delete self.visibleLayer[ id ]
                }
            } )
        } )

        return promise
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerLeaflet.prototype.getView = function () {
        return {
            center: this.map.getCenter(),
            zoom: this.map.getZoom()
        }
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerLeaflet.prototype.basemap.ShadedRelief.labels = [ 'ShadedReliefLabels' ]
    ViewerLeaflet.prototype.basemap.Gray.labels = [ 'GrayLabels' ]
    ViewerLeaflet.prototype.basemap.DarkGray.labels = [ 'DarkGrayLabels' ]
    ViewerLeaflet.prototype.basemap.Imagery.labels = [ 'ImageryTransportation', 'ImageryLabels' ]
    ViewerLeaflet.prototype.basemap.Oceans.labels = [ 'OceansLabels' ]
    // ViewerLeaflet.prototype.basemap.Terrain.labels = [ 'TerrainLabels' ]

    ViewerLeaflet.prototype.setBasemap = function ( basemapId ) {
        var self = this

        if( this.currentBasemap ) {
            this.currentBasemap.forEach( function ( ly ) {
                self.map.removeLayer( ly );
            } )
        }

        this.currentBasemap = this.createBasemapLayer( basemapId );

        this.map.addLayer( this.currentBasemap[ 0 ] );
        this.currentBasemap[ 0 ].bringToBack();

        for ( var i = 1; i < this.currentBasemap.length; i++ )
            this.map.addLayer( this.currentBasemap[ i ] );

        this.changedBaseMap( { baseMap: basemapId } )
    }

    ViewerLeaflet.prototype.createBasemapLayer = function ( basemapId ) {
        var lys = []
        lys.push( L.esri.basemapLayer( basemapId, { detectRetina: true } ) )

        if ( this.basemap[ basemapId ].labels )
            this.basemap[ basemapId ].labels.forEach( function ( id ) {
                lys.push( L.esri.basemapLayer( id, { detectRetina: true } ) )
            } )

        return lys
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerLeaflet.prototype.setLayersVisible = function ( layerIds, visible ) {
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

    ViewerLeaflet.prototype.createLayer = function ( id, layers, zIndex ) {
        return SMK.TYPE.ViewerBase.prototype.createLayer.call( this, id, layers, zIndex, function ( type ) {
            if ( SMK.TYPE.Layer[ type ].leaflet.create )
                return SMK.TYPE.Layer[ type ].leaflet.create.call( this, layers, zIndex )
        } )
    }

    ViewerLeaflet.prototype.zoomToFeature = function ( layer, feature ) {
        this.map.fitBounds( feature.highlightLayer.getBounds(), {
            paddingTopLeft: L.point( 300, 100 ),
            animate: false
        } )
    }

} )

