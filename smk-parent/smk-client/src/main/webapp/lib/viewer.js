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
        ViewerEvent.prototype.constructor.call( this )
    }

    SMK.TYPE.ViewerBase = ViewerBase

    $.extend( ViewerBase.prototype, ViewerEvent.prototype )

    ViewerBase.prototype.destroy = function () {
        ViewerEvent.prototype.destroy()
    }

    ViewerBase.prototype.initialize = function ( smk ) {
        var self = this

        this.identified = new SMK.TYPE.FeatureSet()
        this.selected = new SMK.TYPE.FeatureSet()

        this.layerIds = []
        this.layerId = {}
        this.visibleLayer = {}
        this.layerIdPromise = {}
        this.layerStatus = {}

        return self.initializeLayers( smk )
            .then( function () {
                return self
            } )
    }

    ViewerBase.prototype.initializeLayers = function ( smk ) {
        var self = this;

        if ( !smk.layers || smk.layers.length == 0 ) return SMK.UTIL.resolved()

        self.layerIds = smk.layers.map( function ( ly, i ) {
            self.layerId[ ly.id ] = new SMK.TYPE.Layer[ ly.type ][ smk.viewer.type ]( ly )
            self.layerId[ ly.id ].initialize()
            self.layerId[ ly.id ].index = i

            return ly.id
        } )

        return self.setLayersVisible( self.layerIds.filter( function ( id ) { return self.layerId[ id ].config.isVisible } ), true )
            .catch( function () {} )
    }

    ViewerBase.prototype.createLayer = function ( id, layers, zIndex, create ) {
        var self = this

        if ( layers.length == 0 )
            throw new Error( 'no layers' )

        var type = layers[ 0 ].config.type

        if ( !layers.every( function ( c ) { return c.config.type == type } ) )
            throw new Error( 'types don\'t match' )

        if ( this.layerIdPromise[ id ] )
            return this.layerIdPromise[ id ]

        return this.layerIdPromise[ id ] = SMK.UTIL.resolved()
            .then( function () {
                try {
                    return create.call( self, type )
                }
                catch ( e ) {
                    console.warn( 'failed to create layer', layers, e )
                    return SMK.UTIL.rejected( e )
                }
            } )
            .then( function ( ly ) {
                ly._smk_type = type
                ly._smk_id = id
                return ly
            } )
    }

    ViewerBase.prototype.setLayersVisible = function ( layerIds, visible ) {
    }

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

} )