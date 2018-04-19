include.module( 'layer-leaflet', [ 'layer', 'util' ], function () {

    function defineLayerType( name, def ) {
        var base = SMK.TYPE.Layer[ name ].base

        var lt = function () {
            base.prototype.constructor.apply( this, arguments )
        }

        $.extend( lt.prototype, base.prototype, def )

        SMK.TYPE.Layer[ name ].leaflet = lt
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'folder' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'group' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'wms' )

    SMK.TYPE.Layer[ 'wms' ].leaflet.create = function ( layers, zIndex ) {
        var serviceUrl  = layers[ 0 ].config.serviceUrl
        var layerNames  = layers.map( function ( c ) { return c.config.layerName } ).join( ',' )
        var styleNames  = layers.map( function ( c ) { return c.config.styleName } ).join( ',' )
        var version     = layers[ 0 ].config.version || '1.1.1'
        var attribution = layers[ 0 ].config.attribution
        var opacity     = layers[ 0 ].config.opacity

        var layer = L.nonTiledLayer.wms( serviceUrl, {
            layers:         layerNames,
            styles:         styleNames,
            version:        version,
            attribution:    attribution,
            opacity:        opacity,
            format:         'image/png',
            transparent:    true,
            zIndex:         zIndex
        } )

        layer.on( 'load', function ( ev ) {
            layers.forEach( function ( ly ) {
                ly.loading = false
            } )
        } )

        layer.on( 'loading', function ( ev ) {
            layers.forEach( function ( ly ) {
                ly.loading = true
            } )
        } )

        return layer
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'esri-dynamic' )

    SMK.TYPE.Layer[ 'esri-dynamic' ].leaflet.create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        var serviceUrl  = layers[ 0 ].config.serviceUrl
        var layerNames  = ( layers[ 0 ].config.layers || [] ).join( ',' )
        var dynamicLayers  = layers[ 0 ].config.dynamicLayers.map( function( dl ) { return JSON.parse( dl ) } ) //.join( ',' )
        // var version     = layers[ 0 ].config.version
        // var attribution = layers[ 0 ].config.attribution
        var opacity     = layers[ 0 ].config.opacity

        var minZoom
        if ( layers[ 0 ].config.minScale )
            minZoom = this.getZoomBracketForScale( layers[ 0 ].config.minScale )[ 1 ]

        var maxZoom
        if ( layers[ 0 ].config.maxScale )
            maxZoom = this.getZoomBracketForScale( layers[ 0 ].config.maxScale )[ 1 ]

        var layer = L.esri.dynamicMapLayer( {
            url:            serviceUrl,
            opacity:        opacity,
            layers:         layerNames,
            dynamicLayers:  dynamicLayers,
            maxZoom:        maxZoom,
            minZoom:        minZoom
        });

        layer.on( 'load', function ( ev ) {
            if ( layer._currentImage )
                layer._currentImage.setZIndex( zIndex )

            layers[ 0 ].loading = false
        } )

        layer.on( 'loading', function ( ev ) {
            layers[ 0 ].loading = true
        } )

        return layer
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'kml', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    SMK.TYPE.Layer[ 'kml' ].leaflet.create = function ( layers, zIndex ) {
        var self = this;

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        var jsonLayer = L.geoJson( null, {
            style: convertStyle( layers[ 0 ].config.style ),
            coordsToLatLng: function ( xy ) {
                // if ( !layers[ 0 ].config.CRS ) return xy
                return L.CRS[ layers[ 0 ].config.CRS ].unproject( L.point( xy ) )
            },
            renderer: L.svg(),
            interactive: false
        } )

        if ( !layers[ 0 ].config.dataUrl ) {
            layers[ 0 ].config.dataUrl = this.resolveAttachmentUrl( layers[ 0 ].config.id, layers[ 0 ].config.type )
        }

        if ( !layers[ 0 ].config.CRS )
            layers[ 0 ].config.CRS = 'EPSG4326'

        var kmlLayer = omnivore.kml( layers[ 0 ].config.dataUrl, null, jsonLayer )

        kmlLayer.on( {
            add: function () {
                kmlLayer.options.renderer._container.style.zIndex = zIndex
            }
        } )

        return SMK.UTIL.makePromise( function ( res, rej ) {
            kmlLayer.on( {
                'ready': function () {
                    console.log( 'loaded', layers[ 0 ].config.dataUrl )
                    res( kmlLayer )
                },
                'error': function () {
                    res()
                }
            } )
        } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'vector', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    defineLayerType( 'geojson', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    SMK.TYPE.Layer[ 'vector' ].leaflet.create = SMK.TYPE.Layer[ 'geojson' ].leaflet.create = function ( layers, zIndex ) {
        var self = this

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        var layer = new L.geoJson( null, {
            pointToLayer: function ( geojson, latlng ) {
                return markerForStyle.call( self, latlng, layers[ 0 ].config.style )
            },
            onEachFeature: function ( feature, layer ) {
                if ( layer.setStyle )
                    layer.setStyle( convertStyle( layers[ 0 ].config.style, feature.geometry.type ) )
            },
            renderer: L.svg(),
            interactive: false
        } )

        layer.on( {
            add: function () {
                if ( layer.options.renderer._container )
                    layer.options.renderer._container.style.zIndex = zIndex
            }
        } )

        if ( !layers[ 0 ].config.dataUrl )
            layers[ 0 ].config.dataUrl = this.resolveAttachmentUrl( layers[ 0 ].config.id, 'geojson' )
        else if ( layers[ 0 ].config.dataUrl.startsWith( '@' ) )
            layers[ 0 ].config.dataUrl = this.resolveAttachmentUrl( layers[ 0 ].config.dataUrl.substr( 1 ), 'geojson' )

        if ( !layers[ 0 ].config.CRS )
            layers[ 0 ].config.CRS = 'EPSG4326'

        return SMK.UTIL.makePromise( function ( res, rej ) {
                $.get( layers[ 0 ].config.dataUrl, null, null, 'json' ).then( res, rej )
            } )
            .then( function ( data ) {
                console.log( 'loaded', layers[ 0 ].config.dataUrl )
                layer.addData( data )
                return layer
            } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'clustered', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    SMK.TYPE.Layer[ 'clustered' ].leaflet.create = function ( layers, zIndex ) {
        return SMK.TYPE.Layer[ 'vector' ].leaflet.create.call( this, layers, zIndex )
            .then( function ( layer ) {
                var cluster = L.markerClusterGroup( {
                    // singleMarkerMode: true,
                    // zoomToBoundsOnClick: false,
                    // spiderfyOnMaxZoom: false,
                    // iconCreateFunction: function ( cluster ) {
                    //     var count = cluster.getChildCount();

                    //     return new L.DivIcon( {
                    //         html: '<div><span>' + ( count == 1 ? '' : count > 999 ? 'lots' : count ) + '</span></div>',
                    //         className: 'smk-identify-cluster smk-identify-cluster-' + ( count == 1 ? 'one' : 'many' ),
                    //         iconSize: null
                    //     } )
                    // }
                } )

                cluster.addLayers( [ layer ] )

                return cluster
            } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'heatmap', {

        // getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    SMK.TYPE.Layer[ 'heatmap' ].leaflet.create = function ( layers, zIndex ) {
        return SMK.TYPE.Layer[ 'vector' ].leaflet.create.call( this, layers, zIndex )
            .then( function ( layer ) {

				var points = [];
				var intensity = 100;

				layer.eachLayer( function ( ly ) {
					var centroid = turf.centroid( ly.feature.geometry )
					points.push( [ centroid.geometry.coordinates[ 1 ], centroid.geometry.coordinates[ 0 ], intensity ] )
				});

				return L.heatLayer( points, { radius: 25 } )
            } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function convertStyle( styleConfig, type ) {
        if ( type == 'Point' || type == 'MultiPoint' )
            return {
                radius:      styleConfig.strokeWidth / 2,
                color:       styleConfig.strokeColor,
                weight:      2,
                opacity:     styleConfig.strokeOpacity,
                fillColor:   styleConfig.fillColor,
                fillOpacity: styleConfig.fillOpacity,
            }
        else
            return {
                // stroke:      true,
                color:       styleConfig.strokeColor,
                weight:      styleConfig.strokeWidth,
                opacity:     styleConfig.strokeOpacity,
                // lineCap:     styleConfig.,
                // lineJoin:    styleConfig.,
                // dashArray:   styleConfig.,
                // dashOffset:  styleConfig.,
                // fill:        styleConfig.,
                fillColor:   styleConfig.fillColor,
                fillOpacity: styleConfig.fillOpacity,
                // fillRule:    styleConfig.,
            }
    }

    function markerForStyle( latlng, styleConfig ) {
        if ( styleConfig.markerUrl ) {
            return L.marker( latlng, {
                icon: styleConfig.marker || ( styleConfig.marker = L.icon( {
                    iconUrl: this.resolveAttachmentUrl( styleConfig.markerUrl.substr( 1 ), '' ),
                    iconSize: styleConfig.markerSize,
                    iconAnchor: styleConfig.markerOffset,
                } ) ),
                interactive: false
            } )
        }
        else {
            return L.circleMarker( latlng, {
                interactive: false
            } )
        }
    }

    function getVectorFeaturesAtPoint( location, view, option ) {
        var self = this

        if ( !option.layer ) return

        var features = []
        var test = [ location.map.longitude, location.map.latitude ]
        var toleranceKm = option.tolerance * view.metersPerPixel / 1000;

        option.layer.eachLayer( function ( ly ) {
            var ft = ly.toGeoJSON()

            switch ( ft.geometry.type ) {
            case 'Polygon':
            case 'MultiPolygon':
                if ( turf.booleanPointInPolygon( test, ft ) ) features.push( ft )
                break

            case 'LineString':
            case 'MultiLineString':
                var close = turf.segmentReduce( ft, function ( accum, segment ) {
                    return accum || turf.pointToLineDistance( test, segment ) < toleranceKm
                }, false )
                if ( close ) features.push( ft )
                break

            case 'Point':
            case 'MultiPoint':
                var close = turf.coordReduce( ft, function ( accum, coord ) {
                    return accum || turf.distance( coord, test ) < toleranceKm
                }, false )
                if ( close ) features.push( ft )
                break

            default:
                console.warn( 'skip', ft.geometry.type )
            }
        } )

        features.forEach( function ( f, i ) {
            if ( self.config.titleAttribute )
                f.title = r.attributes[ self.config.titleAttribute ]
            else
                f.title = 'Feature #' + ( i + 1 )
        } )

        return features
    }

} )
