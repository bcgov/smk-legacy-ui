include.module( 'layer', [ 'smk', 'jquery', 'util' ], function () {

    function Layer( config ) {
        $.extend( this, {
            config: config,
            visible: false,
        } )
    }

    Layer.prototype.initialize = function () {
        var self = this

        if ( this.config.attributes ) {
            this.attribute = {}

            this.config.attributes.forEach( function ( at ) {
                if ( at.name in self.attribute )
                    log.warn( 'attribute ' + at.name + ' is duplicated in ' + ly.id )

                self.attribute[ at.name ] = at

                if ( self.config.geometryAttribute && self.config.geometryAttribute == at.name )
                    at.isGeometry = true

                if ( self.config.titleAttribute && self.config.titleAttribute == at.name )
                    at.isTitle = true
            } )
        }
    }

    Layer.prototype.getLegends = function () {
    }

    Layer.prototype.getFeaturesAtPoint = function ( arg ) {
    }

    Layer.prototype.canMergeWith = function ( other ) {
        return false
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    SMK.TYPE.Layer = {}

    function defineLayerType( name, def ) {
        var lt = function () {
            Layer.prototype.constructor.apply( this, arguments )
        }

        $.extend( lt.prototype, Layer.prototype, def )

        SMK.TYPE.Layer[ name ] = { base: lt }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'folder' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'group' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'wms', {

        canMergeWith: function ( other ) {
            if ( this.config.type != other.config.type ) return false
            if ( this.config.serviceUrl != other.config.serviceUrl ) return false
            if ( this.config.opacity != other.config.opacity ) return false

            return true
        },

        getLegends: function () {
            var url =  this.config.serviceUrl + '?' + $.param( {
                SERVICE:    'WMS',
                VERSION:    '1.1.1',
                REQUEST:    'getlegendgraphic',
                FORMAT:     'image/png',
                LAYER:      this.config.layerName,
                STYLE:      this.config.styleName
            } )

            return SMK.UTIL.makePromise( function ( res, rej ) {
                try {
                    var i = $( '<img>' )
                        .on( 'load', function () {
                            res( [ { url: url } ] )
                        } )
                        .error( function ( ev ) {
                            rej( new Error( 'Unable to load: ' + url ) )
                        } )
                        .attr( 'src', url )

                    if ( i.get( 0 ).complete ) {
                        res( [ { url: url } ] )
                    }
                }
                catch ( e ) {
                    rej( e )
                }
            } )
        },

        getFeaturesAtPoint: function ( arg ) {
            var self = this

            var serviceUrl  = this.config.serviceUrl
            var layerName   = this.config.layerName
            var styleName   = this.config.styleName
            var version     = this.config.version || '1.1.1'

            var params = {
                service:       "WMS",
                version:       version,
                request:       "GetFeatureInfo",
                bbox:          arg.bbox,
                feature_count: 20,
                height:        arg.size.height,
                width:         arg.size.width,
                info_format:   'application/json',
                layers:        layerName,
                query_layers:  layerName,
                styles:        styleName
            }

            if ( version == '1.3.0' ) {
                params.crs = 'EPSG:4326'
                params.i =   parseInt( arg.position.x )
                params.j =   parseInt( arg.position.y )
            }
            else {
                params.srs = 'EPSG:4326'
                params.x =   parseInt( arg.position.x )
                params.y =   parseInt( arg.position.y )
            }

            var options = {
                method:    'GET',
                url:       serviceUrl,
                data:      params,
                xhrFields: {},
            };

            return $.ajax( options )
                .then( function ( data ) {
                    if ( data && data.features && data.features.length > 0 )
                        return data.features.map( function ( f, i ) {
                            if ( self.config.titleAttribute )
                                f.title = f.properties[ self.config.titleAttribute ]
                            else
                                f.title = 'Feature #' + ( i + 1 )

                            return f
                        } )
                } )

            // if ( queryLayer.withCreds )
            //     options.xhrFields.withCredentials = true
        },

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'esri-dynamic', {

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

        getFeaturesAtPoint: function ( arg ) {
            var self = this

            var serviceUrl  = this.config.serviceUrl + '/identify'
            var dynamicLayers = '[' + this.config.dynamicLayers.join( ',' ) + ']'

            var param = {
                geometryType:   'esriGeometryPoint',
                sr:             4326,
                tolerance:      1,
                mapExtent:      arg.bbox,
                imageDisplay:   [ arg.size.width, arg.size.height, 96 ].join( ',' ),
                returnGeometry: true,
                returnZ:        false,
                returnM:        false,
                f:              'pjson',
                geometry:       arg.point.lng + ',' + arg.point.lat,
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
                    if ( !data ) return
                    if ( !data.results || data.results.length == 0 ) return

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

    defineLayerType( 'kml', {

        getLegends: createLegendChip,

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'geojson', {

        getLegends: createLegendChip,

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function createLegendChip( width, height ) {
        if ( width == null ) width = 20
        if ( height == null ) height = 20

        var cv = $( '<canvas width="' + width + '" height="' + height + '">' ).get( 0 )
        var ctx = cv.getContext( '2d' )

        ctx.fillStyle = this.config.style.fillColor
        ctx.fillRect( 0, 0, width, height )

        ctx.lineWidth = this.config.style.strokeWidth
        ctx.strokeStyle = this.config.style.strokeColor
        ctx.strokeRect( 0, 0, width, height )

        return SMK.UTIL.resolved( [ {
            url: cv.toDataURL( 'image/png' ),
        } ] )
    }

} )
