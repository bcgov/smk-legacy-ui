include.module( 'viewer', [ 'smk', 'jquery', 'util', 'event', 'layer', 'feature-set' ], function () {

    var ViewerEvent = SMK.TYPE.Event.define( [
        'changedView',
        'changedBaseMap',
        'startedLoading',
        'finishedLoading',
        'startedIdentify',
        'finishedIdentify'
    ] )

    function ViewerBase() {
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

    SMK.TYPE.ViewerBase = ViewerBase

    $.extend( ViewerBase.prototype, ViewerEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerBase.prototype.basemap = {
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
    ViewerBase.prototype.destroy = function () {
        ViewerEvent.prototype.destroy()
    }

    ViewerBase.prototype.initialize = function ( smk ) {
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
        // this.layerStatus = {}
        this.deadViewerLayer = {}

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
    }

    ViewerBase.prototype.initializeLayers = function ( smk ) {
        var self = this;

        if ( !smk.layers || smk.layers.length == 0 ) return SMK.UTIL.resolved()

        return self.setLayersVisible( self.layerIds.filter( function ( id ) { return self.layerId[ id ].config.isVisible } ), true )
            .catch( function () {} )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerBase.prototype.setLayersVisible = function ( layerIds, visible ) {
        var self = this

        var layerCount = this.layerIds.length
        if ( layerCount == 0 ) return

        if ( layerIds.every( function ( id ) { return !self.layerId[ id ].visible == !visible } ) ) return

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
        visibleLayers.forEach( function ( lys, i ) {
            var cid = lys.map( function ( ly ) { return ly.config.id } ).join( '--' )

            delete pending[ cid ]
            if ( self.visibleLayer[ cid ] ) return

            var p = self.createViewerLayer( cid, lys, layerCount - i )
                .then( function ( ly ) {
                    self.addViewerLayer( ly )
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

    ViewerBase.prototype.addViewerLayer = function ( viewerLayer ) {
    }

    ViewerBase.prototype.createViewerLayer = function ( id, layers, zIndex ) {
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

    ViewerBase.prototype.afterCreateViewerLayer = function ( id, type, layers, viewerLayer ) {
        viewerLayer._smk_type = type
        viewerLayer._smk_id = id

        return viewerLayer
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerBase.prototype.identifyFeatures = function ( arg ) {
        var self = this

        this.startedIdentify()

        this.identified.clear()

        var promises = []
        this.layerIds.forEach( function ( id, i ) {
            var ly = self.layerId[ id ]

            if ( !ly.visible ) return

            var p = ly.getFeaturesAtPoint( arg, self.visibleLayer[ id ] )
            if ( !p ) return

            promises.push(
                SMK.UTIL.resolved().then( function () {
                    return p
                } )
                .then( function ( features ) {
                    if ( !features || features.length == 0 ) return

                    self.identified.add( id, features )
                } )
                .catch( function () {
                    console.warn( 'identify fail:', arguments )
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
    ViewerBase.prototype.anyLayersLoading = function () {
        var self = this

        return this.layerIds.some( function ( id ) {
            return self.layerId[ id ].loading
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ViewerBase.prototype.resolveAttachmentUrl = function ( attachmentId, type ) {
        if ( this.disconnected )
            return 'attachments/' + attachmentId + '.' + type
        else
            return '../smks-api/MapConfigurations/' + this.lmfId + '/Attachments/' + attachmentId
    }

} )