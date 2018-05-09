include.module( 'layer-esri3d.layer-vector-esri3d-js', [ 'layer.layer-vector-js', 'types-esri3d' ], function () {

    var E = SMK.TYPE.Esri3d
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function VectorEsri3dLayer() {
        SMK.TYPE.Layer[ 'vector' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( VectorEsri3dLayer.prototype, SMK.TYPE.Layer[ 'vector' ].prototype )

    SMK.TYPE.Layer[ 'vector' ][ 'esri3d' ] = VectorEsri3dLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'vector' ][ 'esri3d' ].create = function ( layers, zIndex ) {
        var self = this;

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        var url = this.resolveAttachmentUrl( layers[ 0 ].config.dataUrl, layers[ 0 ].config.id, 'json' )

        return SMK.UTIL.makePromise( function ( res, rej ) {
            $.get( url, null, null, 'json' ).then( function ( doc ) {
                res( doc )
            }, function () {
                rej( 'request to ' + url + ' failed' )
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
        var line = {
            type: 'line-3d',
            symbolLayers: [ {
                type: 'line',
                size: styleConfig.strokeWidth,
                material: {
                    color: color( styleConfig.strokeColor, styleConfig.strokeOpacity ),
                }
            } ]
        }

        var point = {
            type: 'point-3d',
            symbolLayers: [ {
                type: 'icon',
                size: styleConfig.strokeWidth,
                resource: {
                    primitive: 'circle'
                },
                material: {
                    color: color( styleConfig.fillColor, styleConfig.fillOpacity ),
                },
                outline: {
                    size: 1,
                    color: color( styleConfig.strokeColor, styleConfig.strokeOpacity ),
                }
            } ]
        }

        var fill = {
            type: 'polygon-3d',
            symbolLayers: [ {
                type: 'fill',
                material: {
                    color: color( styleConfig.fillColor, styleConfig.fillOpacity )
                },
            }, line.symbolLayers[ 0 ] ]
        }

        return {
            point: point,
            // multipoint: Object.assign( point, { outline: line } ),
            polyline: line,
            polygon: fill
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
            return obj.coordinates.map( function ( c ) {
                return geoJsonHandler.Point( { type: 'Point', coordinates: c } )
            } )
            .reduce( function( acc, val ) { return acc.concat( val ) }, [] )
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
