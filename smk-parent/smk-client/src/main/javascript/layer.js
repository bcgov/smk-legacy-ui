include.module( 'layer', [ 'smk', 'jquery', 'util', 'event' ], function () {

    var LayerEvent = SMK.TYPE.Event.define( [
        'startedLoading',
        'finishedLoading',
    ] )

    function Layer( config ) {
        var self = this

        LayerEvent.prototype.constructor.call( this )

        $.extend( this, {
            config: config,
            visible: false,
        } )

        var loading = false
        Object.defineProperty( this, 'loading', {
            get: function () { return loading },
            set: function ( v ) {
                if ( !!v == loading ) return
                // console.log( self.config.id, v )
                loading = !!v
                if ( v )
                    self.startedLoading()
                else
                    self.finishedLoading()
            }
        } )

        // Object.defineProperty( this, 'id', {
        //     get: function () { return config.id }
        // } )
    }

    $.extend( Layer.prototype, LayerEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Layer.prototype.initialize = function ( id, index, parentId ) {
        var self = this

        this.id = id
        this.parentId = parentId
        this.index = index

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

    Layer.prototype.hasChildren = function () { return false }

    Layer.prototype.getLegends = function () {
        return SMK.UTIL.resolved()
    }

    Layer.prototype.getFeaturesAtPoint = function ( arg ) {
    }

    Layer.prototype.canMergeWith = function ( other ) {
        return false
    }

    Layer.prototype.inScaleRange = function ( view ) {
        // console.log( this.config.title, this.config.minScale, view.scale, this.config.maxScale )
        if ( this.config.maxScale && view.scale < this.config.maxScale ) return false
        if ( this.config.minScale && view.scale > this.config.minScale ) return false
        return true
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
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

        getFeaturesAtPoint: function ( location, view, option ) {
            var self = this

            var serviceUrl  = this.config.serviceUrl
            var layerName   = this.config.layerName
            var styleName   = this.config.styleName
            var version     = '1.1.1'

            var params = {
                service:       "WMS",
                version:       version,
                request:       "GetFeatureInfo",
                bbox:          view.extent.join( ',' ),
                feature_count: 20,
                height:        view.screen.height,
                width:         view.screen.width,
                info_format:   'application/json',
                layers:        layerName,
                query_layers:  layerName,
                styles:        styleName,
                buffer:        option.tolerance
            }

            if ( version == '1.3.0' ) {
                params.crs = 'EPSG:4326'
                params.i =   parseInt( location.screen.x )
                params.j =   parseInt( location.screen.y )
            }
            else {
                params.srs = 'EPSG:4326'
                params.x =   parseInt( location.screen.x )
                params.y =   parseInt( location.screen.y )
            }

            var options = {
                method:    'GET',
                url:       serviceUrl,
                data:      params,
                xhrFields: {},
            };

            return SMK.UTIL.makePromise( function ( res, rej ) {
                $.ajax( options ).then( res, rej )
            } )
            .then( function ( geojson ) {
                if ( !geojson || !geojson.features || geojson.features.length == 0 ) throw new Error( 'no features' )

                if ( !geojson.crs ) return geojson

                return SMK.UTIL.reproject( geojson, geojson.crs )
            } )
            .then( function ( geojson ) {
                return geojson.features.map( function ( f, i ) {
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

        getFeaturesAtPoint: function ( location, view, option ) {
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
                f:              'json',
                geometry:       location.map.longitude + ',' + location.map.latitude,
                dynamicLayers:  dynamicLayers,
                tolerance:      option.tolerance
            }

            return SMK.UTIL.makePromise( function ( res, rej ) {
                $.ajax( {
                    url:            serviceUrl,
                    type:           'post',
                    data:           param,
                    dataType:       'json',
                    // contentType:    "application/json",
                    // crossDomain:    true,
                    // withCredentials: true,
                } ).then( res, rej )
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

                    if ( f.geometry.type == 'MultiPoint' && f.geometry.coordinates.length == 1 ) {
                        f.geometry.type = 'Point'
                        f.geometry.coordinates = f.geometry.coordinates[ 0 ]
                    }

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

    defineLayerType( 'vector', {

        getLegends: createLegendChip,

        initialize: function () {
            if ( this.hasChildren() )
                this.isContainer = true

            Layer.prototype.initialize.apply( this, arguments )

            if ( this.config.useHeatmap )
                this.config.isQueryable = false
        },

        hasChildren: function () {
            return ( this.config.useRaw + this.config.useClustering + this.config.useHeatmap ) > 1
        },

        childLayerConfigs: function () {
            configs = []

            if ( this.config.useClustering )
                configs.push( Object.assign( {}, this.config, {
                    id: 'clustered',
                    dataUrl: '@' + this.config.id,
                    title: 'Clustered',
                    useRaw: false,
                    useHeatmap: false,
                } ) )

            if ( this.config.useHeatmap )
                configs.push( Object.assign( {}, this.config, {
                    id: 'heatmap',
                    dataUrl: '@' + this.config.id,
                    title: 'Heatmap',
                    useRaw: false,
                    useClustering: false,
                } ) )

            if ( this.config.useRaw )
                configs.push( Object.assign( {}, this.config, {
                    id: 'raw',
                    dataUrl: '@' + this.config.id,
                    title: 'Raw',
                    useHeatmap: false,
                    useClustering: false,
                } ) )

            return configs
        }
    } )

    defineLayerType( 'geojson', {

        getLegends: createLegendChip,

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'clustered', {

        getLegends: createLegendChip,

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'heatmap', {

        initialize: function () {
            Layer.prototype.initialize.apply( this, arguments )

            this.config.isQueryable = false
        },

        // getLegends: createLegendChip,

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
