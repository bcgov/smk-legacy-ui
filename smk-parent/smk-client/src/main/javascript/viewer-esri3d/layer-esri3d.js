include.module( 'layer-esri3d', [ 'smk', 'layer', 'util', 'types-esri3d' ], function () {

    var E = SMK.TYPE.Esri3d

    function defineLayerType( name, def ) {
        var base = SMK.TYPE.Layer[ name ].base

        var lt = function () {
            base.prototype.constructor.apply( this, arguments )
        }

        $.extend( lt.prototype, base.prototype, def )

        SMK.TYPE.Layer[ name ].esri3d = lt
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'folder' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'group' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var WMSLayer = E.layers.BaseDynamicLayer.createSubclass( {
        properties: {
            serviceUrl: null,
            layerNames: [],
            styleNames: [],
            // imageMaxWidth: 1024,
            // imageMaxHeight: 1024,
        },

        getImageUrl: function ( extent, width, height ) {
            var epsg = extent.spatialReference.isWebMercator ? 3857 : extent.spatialReference.wkid

            var param = {
                service:        'WMS',
                request:        'GetMap',
                version:        '1.1.1',
                layers:         this.layerNames.join( ',' ),
                styles:         this.styleNames.join( ',' ),
                format:         'image/png',
                transparent:    'true',
                srs:            'EPSG:' + epsg,
                width:          width,
                height:         height,
                bbox:           [ extent.xmin, extent.ymin, extent.xmax, extent.ymax ].join( ',' )
            }

            return this.serviceUrl + '?' + Object.keys( param ).map( function ( p ) {
                return p + '=' + encodeURIComponent( param[ p ] )
            } ).join( '&' )
        }
    } )

    defineLayerType( 'wms' )

    SMK.TYPE.Layer[ 'wms' ].esri3d.create = function ( layers, zIndex ) {
        var serviceUrl  = layers[ 0 ].config.serviceUrl
        // var version     = layers[ 0 ].config.version || '1.1.1'
        // var attribution = layers[ 0 ].config.attribution
        var opacity     = layers[ 0 ].config.opacity

        var host = serviceUrl.replace( /^(\w+:)?[/][/]/, '' ).replace( /[/].*$/, '' )
        if ( E.config.request.corsEnabledServers.indexOf( host ) == -1 )
            E.config.request.corsEnabledServers.push( host );

        var layer = WMSLayer( {
            serviceUrl: serviceUrl,
            layerNames: layers.map( function ( c ) { return c.config.layerName } ),
            styleNames: layers.map( function ( c ) { return c.config.styleName } ),
            opacity:    opacity,
        } )

        layer.on( 'layerview-create', function ( ev ) {
            E.core.watchUtils.watch( ev.layerView, "updating", function( val ) {
                layers.forEach( function ( ly ) {
                    ly.loading = val
                } )
            } )
        } )

        return layer
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var DynamicMapLayer = E.layers.BaseDynamicLayer.createSubclass( {
        properties: {
            serviceUrl: null,
            dynamicLayers: null,
            // imageMaxWidth: 1024,
            // imageMaxHeight: 1024,
        },

        getImageUrl: function ( extent, width, height ) {
            var epsg = extent.spatialReference.isWebMercator ? 3857 : extent.spatialReference.wkid

            var param = {
                bbox:           [ extent.xmin, extent.ymin, extent.xmax, extent.ymax ].join( ',' ),
                size:           width + ',' + height,
                dpi:            96,
                format:         'png24',
                transparent:    true,
                bboxSR:         epsg,
                imageSR:        epsg,
                dynamicLayers:  JSON.stringify( this.dynamicLayers ),
                f:              'json'
            }

            var url = this.serviceUrl + '/export?' + Object.keys( param ).map( function ( p ) {
                return p + '=' + encodeURIComponent( param[ p ] )
            } ).join( '&' )

            return E.request( url )
                .then( function ( res ) {
                    return res.data.href
                } )
        },
    } )

    defineLayerType( 'esri-dynamic' )

    SMK.TYPE.Layer[ 'esri-dynamic' ].esri3d.create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        var serviceUrl  = layers[ 0 ].config.serviceUrl
        var layerNames  = ( layers[ 0 ].config.layers || [] ).join( ',' )
        var dynamicLayers  = layers[ 0 ].config.dynamicLayers.map( function( dl ) { return JSON.parse( dl ) } )
        // var version     = layers[ 0 ].config.version
        // var attribution = layers[ 0 ].config.attribution
        var opacity     = layers[ 0 ].config.opacity

        var host = serviceUrl.replace( /^(\w+:)?[/][/]/, '' ).replace( /[/].*$/, '' )
        if ( E.config.request.corsEnabledServers.indexOf( host ) == -1 )
            E.config.request.corsEnabledServers.push( host );

        var layer = DynamicMapLayer( {
            serviceUrl: serviceUrl,
            dynamicLayers: dynamicLayers,
            opacity:    opacity,
        } )

        return layer
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'kml', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    SMK.TYPE.Layer[ 'kml' ].esri3d.create = function ( layers, zIndex ) {
        var self = this;

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        if ( !layers[ 0 ].config.dataUrl )
            layers[ 0 ].config.dataUrl = this.resolveAttachmentUrl( layers[ 0 ].config.id, layers[ 0 ].config.type )

        return SMK.UTIL.makePromise( function ( res, rej ) {
            $.get( layers[ 0 ].config.dataUrl, null, null, 'xml' ).then( function ( doc ) {
                res( doc )
            }, function () {
                rej( 'request to ' + layers[ 0 ].config.dataUrl + ' failed' )
            } )
        } )
        .then( function ( doc ) {
            var geojson = toGeoJSON.kml( doc )

            return new E.layers.GraphicsLayer( {
                graphics: geoJsonToEsriGeometry( geojson, convertStyle( layers[ 0 ].config.style ) )
            } )
        } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'geojson', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    SMK.TYPE.Layer[ 'geojson' ].esri3d.create = function ( layers, zIndex ) {
        var self = this;

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        if ( !layers[ 0 ].config.dataUrl )
            layers[ 0 ].config.dataUrl = this.resolveAttachmentUrl( layers[ 0 ].config.id, layers[ 0 ].config.type )

        return SMK.UTIL.makePromise( function ( res, rej ) {
            $.get( layers[ 0 ].config.dataUrl, null, null, 'json' ).then( function ( doc ) {
                res( doc )
            }, function () {
                rej( 'request to ' + layers[ 0 ].config.dataUrl + ' failed' )
            } )
        } )
        .then( function ( geojson ) {
            return new E.layers.GraphicsLayer( {
                graphics: geoJsonToEsriGeometry( geojson, convertStyle( layers[ 0 ].config.style ) )
            } )
        } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function convertStyle( styleConfig ) {
        var point = {
            type: 'simple-marker',
            color: color( styleConfig.fillColor, styleConfig.fillOpacity ),
            size: styleConfig.strokeWidth,
            style: 'circle'
        }

        var line = {
            type: 'simple-line',
            color: color( styleConfig.strokeColor, styleConfig.strokeOpacity ),
            width: styleConfig.strokeWidth,
        }

        var fill = {
            type: 'simple-fill',
            color: color( styleConfig.fillColor, styleConfig.fillOpacity ),
            style: 'solid',
        }

        return {
            point: Object.assign( point, { outline: line } ),
            multipoint: Object.assign( point, { outline: line } ),
            polyline: line,
            polygon: Object.assign( fill, { outline: line } )
        }

        function color( c, a ) {
            var c = new E.Color( c )
            c.a = a
            return c
        }
    }

    function geoJsonToEsriGeometry( geojson, symbol ) {
        var eg = geoJsonHandler[ geojson.type ]( geojson, symbol )
        // console.log( geojson, eg )
        return eg
    }

    var geoJsonHandler = {
        Point: function ( obj ) {
            return [ Object.assign( { type: 'point' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiPoint: function ( obj ) {
            return [ Object.assign( { type: 'multipoint' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        LineString: function ( obj ) {
            return [ Object.assign( { type: 'polyline' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiLineString: function ( obj ) {
            return [ Object.assign( { type: 'polyline' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        Polygon: function ( obj ) {
            return [ Object.assign( { type: 'polygon' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiPolygon: function ( obj ) {
            return [ Object.assign( { type: 'polygon' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        GeometryCollection: function ( obj, symbol ) {
            return obj.geometries.map( function ( g ) {
                return geoJsonHandler[ g.type ]( g, symbol )
            } )
            .reduce( function( acc, val ) { return acc.concat( val ) }, [] )
        },

        FeatureCollection:  function ( obj, symbol ) {
            return obj.features.map( function ( f ) {
                var geoms = geoJsonHandler[ f.geometry.type ]( f.geometry, symbol )
                return geoms.map( function ( g ) {
                    return {
                        attributes: f.properties,
                        geometry:   g,
                        symbol:     symbol[ g.type ]
                    }
                } )
            } )
            .reduce( function( acc, val ) { return acc.concat( val ) }, [] )
        },
    }

    function getVectorFeaturesAtPoint( arg, esri3dLayer ) {
        var self = this

        if ( !esri3dLayer ) return

        var fs = []
        esri3dLayer.eachLayer( function ( sly ) {
            var geoj = sly.toGeoJSON()
            var inp = turf.booleanPointInPolygon( [ arg.point.lng, arg.point.lat ] , geoj )
            // console.log( geoj, inp )
            if ( inp ) fs.push( geoj )
        } )

        fs.forEach( function ( f, i ) {
            if ( self.config.titleAttribute )
                f.title = r.attributes[ self.config.titleAttribute ]
            else
                f.title = 'Feature #' + ( i + 1 )
        } )

        return fs
    }

} )
