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

    Viewer.prototype.identifyFeatures = function ( location ) {
        var self = this

        var view = this.getView()

        this.startedIdentify()

        this.identified.clear()

        var promises = []
        this.layerIds.forEach( function ( id, i ) {
            var ly = self.layerId[ id ]

            if ( !ly.visible ) return
            if ( ly.config.isQueryable === false ) return
            if ( !ly.inScaleRange( view ) ) return

            var p = ly.getFeaturesAtPoint( location, view, self.visibleLayer[ id ] )
            if ( !p ) return

            promises.push(
                SMK.UTIL.resolved().then( function () {
                    return p
                } )
                .then( function ( features ) {
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
    Viewer.prototype.getCurrentLocation = function () {
        var self = this

        if ( this.currentLocationPromise && ( !this.currentLocationTimestamp || this.currentLocationTimestamp > ( ( new Date() ).getTime() - 10 * 60 * 1000 ) ) )
            return this.currentLocationPromise

        this.currentLocationTimestamp = null
        return this.currentLocationPromise = SMK.UTIL.makePromise( function ( res, rej ) {
            navigator.geolocation.getCurrentPosition( res, rej, {
                timeout:            10 * 1000,
                enableHighAccuracy: true,
                // maximumAge:         60 * 1000,
            } )
            setTimeout( function () { rej( new Error( 'timeout' ) ) }, 10 * 1000 )
        } )
        .then( function ( pos ) {
            self.currentLocationTimestamp = ( new Date() ).getTime()
            window.localStorage.setItem( 'smk-location', JSON.stringify( pos.coords ) )
            return pos.coords
        } )
        .catch( function ( err ) {
            var coords = window.localStorage.getItem( 'smk-location' )
            if ( coords ) {
                console.warn( 'using cached location', coords )
                return JSON.parse( coords )
            }

            return Promise.reject( err )
        } )
    }

} )