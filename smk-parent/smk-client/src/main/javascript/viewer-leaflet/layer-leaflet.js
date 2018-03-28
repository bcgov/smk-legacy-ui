include.module( 'layer-leaflet', [ 'smk', 'layer', 'util' ], function () {

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

        console.log(  layers[ 0 ].config.id, layers[ 0 ].config.minScale, layers[ 0 ].config.maxScale, maxZoom, minZoom );

        var layer = L.esri.dynamicMapLayer( {
            url:            serviceUrl,
            opacity:        opacity,
            layers:         layerNames,
            dynamicLayers:  dynamicLayers,
            maxZoom:        maxZoom,
            minZoom:        minZoom
        });
        console.log( layer.minZoom, layer.maxZoom );


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

    defineLayerType( 'geojson', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    SMK.TYPE.Layer[ 'geojson' ].leaflet.create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        var layer = new L.geoJson( null, {
            style: convertStyle( layers[ 0 ].config.style ),
            coordsToLatLng: function ( xy ) {
                // if ( !layers[ 0 ].config.CRS ) return xy
                return L.CRS[ layers[ 0 ].config.CRS ].unproject( L.point( xy ) )
            },
            renderer: L.svg(),
            interactive: false
        } )

        layer.on( {
            add: function () {
                layer.options.renderer._container.style.zIndex = zIndex
            }
        } )

        if ( !layers[ 0 ].config.dataUrl )
            layers[ 0 ].config.dataUrl = this.resolveAttachmentUrl( layers[ 0 ].config.id, layers[ 0 ].config.type )

        if ( !layers[ 0 ].config.CRS )
            layers[ 0 ].config.CRS = 'EPSG4326'

        return $.get( layers[ 0 ].config.dataUrl, null, null, 'json' )
            .then( function ( data ) {
                console.log( 'loaded', layers[ 0 ].config.dataUrl )
                layer.addData( data )
                return layer
            } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function convertStyle( styleConfig ) {
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

    function getVectorFeaturesAtPoint( location, view, leafletLayer ) {
        var self = this

        if ( !leafletLayer ) return

        var fs = []
        leafletLayer.eachLayer( function ( sly ) {
            var geoj = sly.toGeoJSON()
            var inp = turf.booleanPointInPolygon( [ location.map.longitude, location.map.latitude ] , geoj )
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
