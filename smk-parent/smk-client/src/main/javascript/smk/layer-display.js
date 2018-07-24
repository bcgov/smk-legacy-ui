include.module( 'layer-display', [ 'jquery', 'util', 'event' ], function () {
    "use strict";

    var LayerDisplayEvent = SMK.TYPE.Event.define( [
    ] )

    function LayerDisplay( option ) {
        LayerDisplayEvent.prototype.constructor.call( this )

        Object.defineProperty( this, 'id', {
            get: function () { return option.id },
        } )

        Object.defineProperty( this, 'opacity', {
            get: function () { return option.opacity },
        } )

        Object.defineProperty( this, 'title', {
            get: function () { return option.title },
        } )

        Object.defineProperty( this, 'isVisible', {
            get: function () { return option.isVisible },
        } )
    }

    SMK.TYPE.LayerDisplay = LayerDisplay

    $.extend( LayerDisplay.prototype, LayerDisplayEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //

    LayerDisplay.Item = function ( option, viewer ) {
        if ( !( option.layerId in viewer.layerId ) )
            throw new Error( 'layer id "' + option.layerId + '" isn\'t defined' )

        var ly = viewer.layerId[ option.layerId ]

        if ( !option.id )
            option.id = option.layerId

        if ( !option.opacity )
            option.opacity = ly.config.opacity 

        if ( !option.title )
            option.title = ly.config.title 

        if ( !( 'isVisible' in option ) )
            option.isVisible = ly.config.isVisible 
        
        LayerDisplay.prototype.constructor.call( this, option )

        Object.defineProperty( this, 'layerId', {
            get: function () { return option.layerId },
        } )
    }

    $.extend( LayerDisplay.Item.prototype, LayerDisplay.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //

    LayerDisplay.List = function ( option, viewer ) {
        LayerDisplay.prototype.constructor.call( this, option )

    }

    $.extend( LayerDisplay.List.prototype, LayerDisplay.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //

    LayerDisplay.create( layerDisplay, viewer ) {
        if ( 'layerId' in layerDisplay && 'layerList' in layerDisplay )
            throw new Error( 'layerDisplay can\'t define both layerId and layerList' )

        if ( !( 'layerId' in layerDisplay ) && !( 'layerList' in layerDisplay ) )
            throw new Error( 'layerDisplay must define one of layerId or layerList' )

        if ( 'layerId' in layerDisplay )
            return new LayerDisplay.Item( layerDisplay, viewer )
        else
            return new LayerDisplay.List( layerDisplay, viewer )
    } 

    LayerDisplay.prototype.add = function ( layerId, features, keyAttribute ) {
        var self = this

        var ids = features.map( function ( f ) {
            var nonce = 0
            var id = featureId( f, keyAttribute, nonce )

            while ( id in self.featureSet ) {
                // console.warn( 'collision', f, id, nonce )

                var other = self.featureSet[ id ]
                if ( SMK.UTIL.isDeepEqual( f.properties, other.properties ) ) {
                    // console.warn( 'already present', f, other )
                    return
                }

                id = featureId( f, keyAttribute, nonce )
                nonce += 1
            }

            f.id = id
            f.layerId = layerId

            self.featureSet[ id ] = f

            return id
        } ).filter( function ( id ) { return !!id } )

        if ( ids.length > 0 )
            this.addedFeatures( {
                features: ids.map( function ( id ) { return self.featureSet[ id ] } ),
                layerId: layerId
            } )

        return ids
    }

    FeatureSet.prototype.remove = function ( featureIds ) {
        var self = this

        var fs = featureIds.map( function ( id ) {
            if ( !( id in self.featureSet ) ) return

            var f = self.featureSet[ id ]
            delete self.featureSet[ id ]

            return f
        } ).filter( function ( f ) { return !!f } )

        if ( fs.length > 0 )
            this.removedFeatures( {
                features: fs
            } )

        return fs.map( function ( f ) { return f.id } )
    }

    FeatureSet.prototype.pick = function ( featureId, option ) {
        if ( featureId && !this.has( featureId ) )
            throw new Error( 'feature id ' + featureId + ' not present' )

        if ( this.pickedFeatureId == featureId ) return

        var old = this.pickedFeatureId
        this.pickedFeatureId = featureId

        this.pickedFeature( Object.assign( {
            feature: featureId && this.featureSet[ featureId ],
            was: old && this.featureSet[ old ]
        }, option ) )

        return old
    }

    FeatureSet.prototype.zoomTo = function ( featureId ) {
        if ( featureId && !this.has( featureId ) )
            throw new Error( 'feature id ' + featureId + ' not present' )

        this.zoomToFeature( {
            feature: featureId && this.featureSet[ featureId ],
        } )
    }

    FeatureSet.prototype.highlight = function ( featureIds ) {
        var self = this

        var oldIds = Object.keys( this.highlightedFeatureId )

        this.highlightedFeatureId = {}

        var features
        if ( featureIds )
            features = featureIds.map( function ( id ) {
                if ( !self.has( id ) )
                    throw new Error( 'feature id ' + featureId + ' not present' )

                self.highlightedFeatureId[ id ] = true

                return self.featureSet[ id ]
            } )

        var oldFeatures
        if ( oldIds )
            oldFeatures = oldIds.map( function ( id ) {
                return self.featureSet[ id ]
            } )

        this.highlightedFeatures( {
            features: features,
            was: oldFeatures
        } )

        return oldIds
    }

    FeatureSet.prototype.isEmpty = function () {
        return Object.keys( this.featureSet ).length == 0
    }

    FeatureSet.prototype.clear = function () {
        this.featureSet = {}
        this.pickedFeatureId = null

        this.clearedFeatures()
    }

    FeatureSet.prototype.has = function ( id ) {
        return id in this.featureSet
    }

    FeatureSet.prototype.get = function ( id ) {
        return this.featureSet[ id ]
    }

    FeatureSet.prototype.isPicked = function ( id ) {
        return this.pickedFeatureId == id
    }

    FeatureSet.prototype.isHighlighted = function ( id ) {
        return !!this.highlightedFeatureId[ id ]
    }

    FeatureSet.prototype.getPicked = function () {
        if ( !this.pickedFeatureId ) return

        return this.featureSet[ this.pickedFeatureId ]
    }

    FeatureSet.prototype.getStats = function () {
        var self = this

        var ids = Object.keys( this.featureSet )
        var v, l
        return {
            get featureCount() { return ids.length },
            get vertexCount() {
                return v || ( v = ids.reduce( function ( accum, id ) {
                    return accum + turf.coordReduce( self.featureSet[ id ].geometry, function ( accum ) {
                        return accum + 1
                    }, 0 )
                }, 0 ) )
            },
            get layerCount() {
                return l || ( l = Object.keys( ids.reduce( function ( accum, id ) {
                    accum[ self.featureSet[ id ].layerId ] = ( accum[ self.featureSet[ id ].layerId ] || 0 ) + 1
                    return accum
                }, {} ) ).length )
            }
        }
    }

} )