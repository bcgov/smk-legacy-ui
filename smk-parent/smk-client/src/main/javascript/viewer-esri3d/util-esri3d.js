include.module( 'util-esri3d', [ 'types-esri3d' ], function ( inc ) {

    Object.assign( window.SMK.UTIL, {
        geoJsonToEsriGeometry: ( function () {
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

            return function ( geojson, symbol ) {
                var eg = geoJsonHandler[ geojson.type ]( geojson, symbol )
                // console.log( geojson, eg )
                return eg
            }
        } )(),

        smkStyleToEsriSymbol: function ( styleConfig ) {
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
                var c = new SMK.TYPE.Esri3d.Color( c )
                c.a = a
                return c
            }
        }

    } )

} )