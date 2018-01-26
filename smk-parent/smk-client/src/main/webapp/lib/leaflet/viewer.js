include.module( 'viewer-leaflet', [ 'viewer', 'leaflet' ], function () {

    function ViewerLeaflet() {
        SMK.TYPE.ViewerBase.prototype.constructor.apply( this, arguments )
    }

    if ( !SMK.TYPE.Viewer ) SMK.TYPE.Viewer = {}
    SMK.TYPE.Viewer.leaflet = ViewerLeaflet

    $.extend( ViewerLeaflet.prototype, SMK.TYPE.ViewerBase.prototype )

    ViewerLeaflet.prototype.initialize = function ( smk ) {
        var self = this

        var promise = SMK.TYPE.ViewerBase.prototype.initialize.apply( this, arguments )

        var el = smk.addToContainer( '<div class="smk-viewer">' )

        this.map = L.map( el )

        // var southWest = L.latLng(47.294133725, -113.291015625),
        //     northEast = L.latLng(61.1326289908, -141.064453125),
        //     bounds = L.latLngBounds(southWest, northEast);
        // this.map.fitBounds(bounds);


        if ( smk.viewport ) {
            if ( smk.viewport.bbox ) {
                var bx = smk.viewport.bbox
                this.map.fitBounds( [ [ bx[ 1 ], bx[ 0 ] ], [ bx[ 3 ], bx[ 2 ] ] ] );
            }

            if ( smk.viewport.baseMap )
                this.setBasemap( smk.viewport.baseMap )
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

    ViewerLeaflet.prototype.getView = function () {
        return {
            center: this.map.getCenter(),
            zoom: this.map.getZoom()
        }
    }

    var basemapHasLabels = {
        'ShadedRelief': true,
        'Oceans': true,
        'Gray': true,
        'DarkGray': true,
        'Imagery': true,
        'Terrain': true,
    }

    ViewerLeaflet.prototype.setBasemap = function ( basemapName ) {
        if( this.currentBasemap ) {
            if ( this.currentBasemap.features )
                this.map.removeLayer( this.currentBasemap.features );

            if ( this.currentBasemap.labels )
                this.map.removeLayer( this.currentBasemap.labels );
        }

        this.currentBasemap = {
            features: L.esri.basemapLayer( basemapName, { detectRetina: true } ),
            labels: basemapHasLabels[ basemapName ] && L.esri.basemapLayer( basemapName + 'Labels' )
        }

        this.map.addLayer( this.currentBasemap.features );
        this.currentBasemap.features.bringToBack();

        if ( this.currentBasemap.labels )
            this.map.addLayer( this.currentBasemap.labels );

        this.changedBaseMap( { baseMap: basemapName } )
    }

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

