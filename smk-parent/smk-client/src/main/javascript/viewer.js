include.module( 'viewer', [ 'smk', 'jquery', 'util', 'event', 'layer', 'feature-set' ], function () {

    var ViewerEvent = SMK.TYPE.Event.define( [
        'changedView',
        'changedBaseMap',
        'startedLoading',
        'finishedLoading',
        'startedIdentify',
        'finishedIdentify',
        'pickedLocation'
    ] )

    function Viewer() {
        var self = this

        ViewerEvent.prototype.constructor.call( this )

        var loading = false
        Object.defineProperty( this, 'loading', {
            get: function () { return loading },
            set: function ( v ) {
                if ( !!v == loading ) return
                // console.log( 'viewer', v )
                loading = !!v
                if ( v )
                    self.startedLoading()
                else
                    self.finishedLoading()
            }
        } )
    }

    SMK.TYPE.Viewer = Viewer

    $.extend( Viewer.prototype, ViewerEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.basemap = {
        Topographic: {
            order: 1,
            title: 'Topographic'
        },
        Streets: {
            order: 2,
            title: 'Streets'
        },
        Imagery: {
            order: 3,
            title: 'Imagery'
        },
        Oceans: {
            order: 4,
            title: 'Oceans'
        },
        NationalGeographic: {
            order: 5,
            title: 'National Geographic'
        },
        ShadedRelief: {
            order: 6,
            title: 'Shaded Relief'
        },
        DarkGray: {
            order: 7,
            title: 'Dark Gray'
        },
        Gray: {
            order: 8,
            title: 'Gray'
        },
        // Terrain: {
        //     order: 9,
        //     title: 'Terrain'
        // },
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    // for(s=1;s<25;s++){v.map.setZoom(s,{animate:false});console.log(s,v.getScale())}
    Viewer.prototype.zoomScale = []
    Viewer.prototype.zoomScale[  1 ] = 173451547.7127784
    Viewer.prototype.zoomScale[  2 ] = 89690013.7670628
    Viewer.prototype.zoomScale[  3 ] = 45203253.08071528
    Viewer.prototype.zoomScale[  4 ] = 22617698.02495323
    Viewer.prototype.zoomScale[  5 ] = 11314385.218894083
    Viewer.prototype.zoomScale[  6 ] = 5659653.605577067
    Viewer.prototype.zoomScale[  7 ] = 2829913.245708334
    Viewer.prototype.zoomScale[  8 ] = 1414856.836779603
    Viewer.prototype.zoomScale[  9 ] = 707429.7690058348
    Viewer.prototype.zoomScale[ 10 ] = 353715.05331990693
    Viewer.prototype.zoomScale[ 11 ] = 176857.5477505768
    Viewer.prototype.zoomScale[ 12 ] = 88428.77649887519
    Viewer.prototype.zoomScale[ 13 ] = 44214.496444883276
    Viewer.prototype.zoomScale[ 14 ] = 22107.221783884223
    Viewer.prototype.zoomScale[ 15 ] = 11053.61708610345
    Viewer.prototype.zoomScale[ 16 ] = 5526.806585855153
    Viewer.prototype.zoomScale[ 17 ] = 2763.4019883053297
    Viewer.prototype.zoomScale[ 18 ] = 1381.6944712225031
    Viewer.prototype.zoomScale[ 19 ] = 690.8367988270104

    Viewer.prototype.getZoomBracketForScale = function ( scale ) {
        if ( scale > this.zoomScale[ 1 ] ) return [ 0, 1 ]
        if ( scale < this.zoomScale[ 19 ] ) return [ 19, 20 ]
        for ( var z = 2; z < 20; z++ )
            if ( scale > this.zoomScale[ z ] ) return [ z - 1, z ]
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.destroy = function () {
        ViewerEvent.prototype.destroy()
    }

    Viewer.prototype.initialize = function ( smk ) {
        var self = this

        this.lmfId = smk.lmfId
        this.type = smk.viewer.type
        this.disconnected = smk.$option.disconnected

        this.identified = new SMK.TYPE.FeatureSet()
        this.selected = new SMK.TYPE.FeatureSet()
        this.searched = new SMK.TYPE.FeatureSet()

        this.layerIds = []
        this.layerId = {}
        this.visibleLayer = {}
        this.layerIdPromise = {}
        this.deadViewerLayer = {}
        this.handler = {
            pick: {}
        }

        if ( Array.isArray( smk.layers ) )
            self.layerIds = smk.layers.map( function ( lyConfig, i ) {
                var ly = self.layerId[ lyConfig.id ] = new SMK.TYPE.Layer[ lyConfig.type ][ smk.viewer.type ]( lyConfig )

                ly.initialize()
                ly.index = i

                ly.startedLoading( function () {
                    self.loading = true
                } )

                ly.finishedLoading( function () {
                    self.loading = self.anyLayersLoading()
                } )

                return lyConfig.id
            } )

        this.pickedLocation( function ( ev ) {
            var pickHandler = self.handler.pick
            if ( !pickHandler ) return

            var h = 'identify'
            Object.keys( pickHandler ).forEach( function ( t ) {
                if ( smk.$tool[ t ].active ) h = t
            } )
            if ( typeof pickHandler[ h ] != 'function' ) return

            pickHandler[ h ].call( smk.$tool[ h ], ev )
        } )
    }

    Viewer.prototype.initializeLayers = function ( smk ) {
        var self = this;

        if ( !smk.layers || smk.layers.length == 0 ) return SMK.UTIL.resolved()

        return self.setLayersVisible( self.layerIds.filter( function ( id ) { return self.layerId[ id ].config.isVisible } ), true )
            .catch( function () {} )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.setLayersVisible = function ( layerIds, visible ) {
        var self = this

        var layerCount = this.layerIds.length
        if ( layerCount == 0 ) return SMK.UTIL.resolved()

        if ( layerIds.every( function ( id ) { return !self.layerId[ id ].visible == !visible } ) ) return SMK.UTIL.resolved()

        var pending = {}
        self.layerIds.forEach( function ( id ) {
            pending[ id ] = true
        } )
        Object.keys( self.visibleLayer ).forEach( function ( id ) {
            pending[ id ] = true
        } )

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
                merged.push( ly )
                return
            }

            visibleLayers.push( merged )
            merged = [ ly ]
        } )
        if ( merged )
            visibleLayers.push( merged )

        var promises = []
        var maxZOrder = visibleLayers.length - 1
        visibleLayers.forEach( function ( lys, i ) {
            var cid = lys.map( function ( ly ) { return ly.config.id } ).join( '--' )

            delete pending[ cid ]
            if ( self.visibleLayer[ cid ] ) {
                self.positionViewerLayer( ly, maxZOrder - i )
                return
            }

            var p = self.createViewerLayer( cid, lys, maxZOrder - i )
                .then( function ( ly ) {
                    self.addViewerLayer( ly )
                    self.positionViewerLayer( ly, maxZOrder - i )
                    self.visibleLayer[ cid ] = ly
                    return ly
                } )

            promises.push( p )
        } )

        Object.assign( this.deadViewerLayer, pending )

        if ( promises.length == 0 )
            self.finishedLoading()

        return SMK.UTIL.waitAll( promises )
    }

    Viewer.prototype.addViewerLayer = function ( viewerLayer ) {
    }

    Viewer.prototype.positionViewerLayer = function ( viewerLayer, zOrder ) {
    }

    Viewer.prototype.createViewerLayer = function ( id, layers, zIndex ) {
        var self = this

        if ( layers.length == 0 )
            throw new Error( 'no layers' )

        var type = layers[ 0 ].config.type

        if ( !layers.every( function ( c ) { return c.config.type == type } ) )
            throw new Error( 'types don\'t match' )

        if ( this.layerIdPromise[ id ] )
            return this.layerIdPromise[ id ]

        if ( !SMK.TYPE.Layer[ type ][ self.type ].create )
            return SMK.UTIL.rejected( new Error( 'can\'t create viewer layer of type "' + type + '"' ) )

        return this.layerIdPromise[ id ] = SMK.UTIL.resolved()
            .then( function () {
                try {
                    return SMK.TYPE.Layer[ type ][ self.type ].create.call( self, layers, zIndex )
                }
                catch ( e ) {
                    console.warn( 'failed to create viewer layer', layers, e )
                    return SMK.UTIL.rejected( e )
                }
            } )
            .then( function ( ly ) {
                return self.afterCreateViewerLayer( id, type, layers, ly )
            } )
    }

    Viewer.prototype.afterCreateViewerLayer = function ( id, type, layers, viewerLayer ) {
        viewerLayer._smk_type = type
        viewerLayer._smk_id = id

        return viewerLayer
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.getView = function () {
        throw new Error( 'not implemented' )
    }

    Viewer.prototype.identifyFeatures = function ( location, option ) {
        var self = this

        option = Object.assign( {
            tolerance: 3
        }, option )

        var view = this.getView()

        this.startedIdentify()

        this.identified.clear()

        var promises = []
        this.layerIds.forEach( function ( id, i ) {
            var ly = self.layerId[ id ]

            if ( !ly.visible ) return
            if ( ly.config.isQueryable === false ) return
            if ( !ly.inScaleRange( view ) ) return

            option.layer = self.visibleLayer[ id ]

            var p = ly.getFeaturesAtPoint( location, view, option )
            if ( !p ) return

            promises.push(
                SMK.UTIL.resolved().then( function () {
                    return p
                } )
                .then( function ( features ) {
                    features.forEach( function ( f ) {
                        f._identifyPoint = location.map
                    } )
                    self.identified.add( id, features )
                } )
                .catch( function ( err ) {
                    console.debug( id, 'identify fail:', err.message )
                    return SMK.UTIL.resolved()
                } )
            )
        } )

        return SMK.UTIL.waitAll( promises )
            .then( function () {
                self.finishedIdentify()
            } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.anyLayersLoading = function () {
        var self = this

        return this.layerIds.some( function ( id ) {
            return self.layerId[ id ].loading
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.resolveAttachmentUrl = function ( attachmentId, type ) {
        if ( this.disconnected )
            return 'attachments/' + attachmentId + '.' + type
        else
            return '../smks-api/MapConfigurations/' + this.lmfId + '/Attachments/' + attachmentId
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.handlePick = function ( tool, handler ) {
        this.handler.pick[ tool.type ] = handler
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.pixelsToMillimeters = ( function () {
        var e = document.createElement( 'div' )
        e.style = 'height:1mm; display:none'
        e.id = 'heightRef'
        document.body.appendChild( e )

        var pixPerMillimeter = $( '#heightRef' ).height()

        e.parentNode.removeChild( e )

        return function ( pixels ) {
            return pixels / pixPerMillimeter
        }
    } )()
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.getCurrentLocation = function ( option ) {
        var self = this

        option = Object.assign( {
            timeout:         10 * 1000,
            maxAge:     10 * 60 * 1000,
            cacheKey:   'smk-location'
        }, option )

        if ( this.currentLocationPromise && ( !this.currentLocationTimestamp || this.currentLocationTimestamp > ( ( new Date() ).getTime() - option.maxAge ) ) )
            return this.currentLocationPromise

        this.currentLocationTimestamp = null
        return this.currentLocationPromise = SMK.UTIL.makePromise( function ( res, rej ) {
            navigator.geolocation.getCurrentPosition( res, rej, {
                timeout:            option.timeout,
                enableHighAccuracy: true,
            } )
            setTimeout( function () { rej( new Error( 'timeout' ) ) }, option.timeout )
        } )
        .then( function ( pos ) {
            self.currentLocationTimestamp = ( new Date() ).getTime()
            window.localStorage.setItem( option.cacheKey, JSON.stringify( { latitude: pos.coords.latitude, longitude: pos.coords.longitude } ) )
            return pos.coords
        } )
        .catch( function ( err ) {
            try {
                var coords = JSON.parse( window.localStorage.getItem( option.cacheKey ) )
                if ( coords && coords.latitude ) {
                    console.warn( 'using cached location', coords )
                    return coords
                }
            }
            catch ( e ) {}
            return Promise.reject( err )
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Viewer.prototype.findNearestSite = function ( location ) {
        var self = this

        var query = {
            point:              [ location.longitude, location.latitude ].join( ',' ),
            outputSRS:          4326,
            locationDescriptor: 'routingPoint',
            maxDistance:        1000,
        }

        return SMK.UTIL.makePromise( function ( res, rej ) {
            $.ajax( {
                timeout:    10 * 1000,
                dataType:   'json',
                url:        'https://geocoder.api.gov.bc.ca/sites/nearest.geojson',
                data:       query,
            } ).then( res, rej )
        } )
        .then( function ( data ) {
            return data.properties
        } )
    }

} )