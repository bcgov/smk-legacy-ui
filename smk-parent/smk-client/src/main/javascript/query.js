include.module( 'query', [ 'smk', 'jquery', 'util', 'event' ], function () {

    var QueryEvent = SMK.TYPE.Event.define( [
        // 'startedLoading',
        // 'finishedLoading',
    ] )

    function Query( layer, config ) {
        var self = this

        QueryEvent.prototype.constructor.call( this )

        $.extend( this, {
            layer: layer
        }, config )

        // var loading = false
        // Object.defineProperty( this, 'loading', {
        //     get: function () { return loading },
        //     set: function ( v ) {
        //         if ( !!v == loading ) return
        //         // console.log( self.config.id, v )
        //         loading = !!v
        //         if ( v )
        //             self.startedLoading()
        //         else
        //             self.finishedLoading()
        //     }
        // } )
    }

    $.extend( Query.prototype, QueryEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    // Query.prototype.initialize = function () {
    //     var self = this

    //     if ( this.config.attributes ) {
    //         this.attribute = {}

    //         this.config.attributes.forEach( function ( at ) {
    //             if ( at.name in self.attribute )
    //                 log.warn( 'attribute ' + at.name + ' is duplicated in ' + ly.id )

    //             self.attribute[ at.name ] = at

    //             if ( self.config.geometryAttribute && self.config.geometryAttribute == at.name )
    //                 at.isGeometry = true

    //             if ( self.config.titleAttribute && self.config.titleAttribute == at.name )
    //                 at.isTitle = true
    //         } )
    //     }
    // }

    // Query.prototype.getLegends = function () {
    // }

    // Query.prototype.getFeaturesAtPoint = function ( arg ) {
    // }

    // Query.prototype.canMergeWith = function ( other ) {
    //     return false
    // }

    // Query.prototype.inScaleRange = function ( view ) {
    //     console.log( this.config.title, this.config.scaleMin, view.scale, this.config.scaleMax )
    //     if ( this.config.scaleMax && view.scale > this.config.scaleMax ) return false
    //     if ( this.config.scaleMin && view.scale < this.config.scaleMin ) return false
    //     return true
    // }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Query = {}

    function defineQueryType( name, def ) {
        var qt = function () {
            Query.prototype.constructor.apply( this, arguments )
        }

        $.extend( qt.prototype, Query.prototype, def )

        SMK.TYPE.Query[ name ] = qt
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'folder' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'group' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'wms', {
    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'esri-dynamic', {

        getLegends: function () {
            var legendRequest = this.config.serviceUrl + '/legend?f=pjson&dynamicLayers=' + JSON.stringify( this.config.dynamicLayers.map( function( dl ) { return JSON.parse( dl ) } ) );
            return $.ajax( {
                url: legendRequest,
                type: "get",
                dataType: "jsonp",
                contentType: "application/json",
                crossDomain: true,
                withCredentials: true,
            } )
            .then ( function ( data ) {
                var layer = data.layers[0]; // should only get one back...

                return layer.legend.map( function( obj ) {
                    return {
                        url: 'data:image/png;base64,' + obj.imageData,
                        title: obj.label
                    }
                } )
            } )
        },

        getFeaturesAtPoint: function ( location, view ) {
            var self = this

            var serviceUrl  = this.config.serviceUrl + '/identify'
            var dynamicLayers = '[' + this.config.dynamicLayers.join( ',' ) + ']'

            var param = {
                geometryType:   'esriGeometryPoint',
                sr:             4326,
                tolerance:      1,
                mapExtent:      view.extent.join( ',' ),
                imageDisplay:   [ view.screen.width, view.screen.height, 96 ].join( ',' ),
                returnGeometry: true,
                returnZ:        false,
                returnM:        false,
                f:              'pjson',
                geometry:       location.map.longitude + ',' + location.map.latitude,
                dynamicLayers:  dynamicLayers
            }

            return $.ajax( {
                    url:            serviceUrl,
                    type:           "get",
                    data:           param,
                    dataType:       "jsonp",
                    contentType:    "application/json",
                    crossDomain:    true,
                    withCredentials: true,
                } )
                .then( function ( data ) {
                    if ( !data ) throw new Error( 'no features' )
                    if ( !data.results || data.results.length == 0 ) throw new Error( 'no features' )

                    return data.results.map( function ( r, i ) {
                        var f = {}

                        if ( self.config.titleAttribute )
                            f.title = r.attributes[ self.config.titleAttribute ]
                        else if ( r.displayFieldName )
                            f.title = r.attributes[ r.displayFieldName ]
                        else
                            f.title = 'Feature #' + ( i + 1 )

                        f.geometry = Terraformer.ArcGIS.parse( r.geometry )
                        f.properties = r.attributes

                        return f
                    } )
                } )
        },


    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'kml', {

        getLegends: createLegendChip,

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'geojson', {

        getLegends: createLegendChip,

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function createLegendChip( width, height ) {
        if ( width == null ) width = 20
        if ( height == null ) height = 20

        var cv = $( '<canvas width="' + width + '" height="' + height + '">' ).get( 0 )
        var ctx = cv.getContext( '2d' )

        ctx.fillStyle = '#' + this.config.style.fillColor
        ctx.fillRect( 0, 0, width, height )

        ctx.lineWidth = this.config.style.strokeWidth
        ctx.strokeStyle = '#' + this.config.style.strokeColor
        ctx.strokeRect( 0, 0, width, height )

        return SMK.UTIL.resolved( [ {
            url: cv.toDataURL( 'image/png' ),
        } ] )
    }

} )
