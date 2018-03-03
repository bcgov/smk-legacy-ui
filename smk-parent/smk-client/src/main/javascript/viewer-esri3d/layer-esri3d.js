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

    defineLayerType( 'wms' )

    // SMK.TYPE.Layer[ 'wms' ].esri3d.create = function ( layers, zIndex ) {
    //     var serviceUrl  = layers[ 0 ].config.serviceUrl
    //     var layerNames  = layers.map( function ( c ) { return c.config.layerName } ).join( ',' )
    //     var styleNames  = layers.map( function ( c ) { return c.config.styleName } ).join( ',' )
    //     var version     = layers[ 0 ].config.version || '1.1.1'
    //     var attribution = layers[ 0 ].config.attribution
    //     var opacity     = layers[ 0 ].config.opacity

    //     var layer = L.nonTiledLayer.wms( serviceUrl, {
    //         layers:         layerNames,
    //         styles:         styleNames,
    //         version:        version,
    //         attribution:    attribution,
    //         opacity:        opacity,
    //         format:         'image/png',
    //         transparent:    true,
    //         zIndex:         zIndex
    //     } )

    //     return layer
    // }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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

		// if(!mpcmRootLayer)
		// {

        Object.assign( dynamicLayers[ 0 ], dynamicLayers[ 0 ].drawingInfo )
        delete dynamicLayers[ 0 ].drawingInfo
        delete dynamicLayers[ 0 ].transparency
        dynamicLayers[ 0 ].opacity = 1
        dynamicLayers[ 0 ].visible = true
        dynamicLayers[ 0 ].renderer.symbol.type = 'picture-marker'
         var mapImageLayer = new E.layers.MapImageLayer( {
            url:        serviceUrl,
            // title:      "DataBC Catalog",
            // visible:    true,
            sublayers:  dynamicLayers
        } )

			// map.layers.add(mapImageLayer);
		// }

		// build the sublayer
		// dynamicJson = dynamicJson[0];
		// var renderer;
		// if(dynamicJson.drawingInfo.renderer.type == "uniqueValue")
		// {
		// 	renderer = UniqueValueRenderer.fromJSON(dynamicJson.drawingInfo.renderer);
		// }
		// else if(dynamicJson.drawingInfo.renderer.type == "classBreaks")
		// {
		// 	renderer = ClassBreaksRenderer.fromJSON(dynamicJson.drawingInfo.renderer);
		// }
		// else renderer = SimpleRenderer.fromJSON(dynamicJson.drawingInfo.renderer)

		// var popupParsed;
		// if(popupTemplate && popupTemplate != "") popupParsed = JSON.parse(popupTemplate);

		// var sl =
		// {
		// 	id: dynamicJson.id,
	    //     title: title,
	    //     opacity: opacity,
	    //     definitionExpression: dynamicJson.definitionExpression,
	    //     labelsVisible: dynamicJson.labelsVisible,
	    //     renderer: renderer,
	    //     source: dynamicJson.source,
	    //     visible: visibility,
	    //     labelingInfo: dynamicJson.labelingInfo,
	    //     popupTemplate: popupParsed
		// }

		// layerExtras.push(
		// {
		// 	id: dynamicJson.id,
		// 	metadata: metadataLink,
		// 	minScale: minScale,
		// 	maxScale: maxScale
		// });

		// add popup templates to sl: popupTemplate: popupTemplate. We can build the popup template
		// in the java side and inject here... might make the process a little slower though?

		// mapImageLayer.sublayers.push( dynamicLayers[ 0 ] )





        // var layer = L.esri.dynamicMapLayer( {
        //     url:            serviceUrl,
        //     opacity:        opacity,
        //     layers:         layerNames,
        //     dynamicLayers:  dynamicLayers
        // });
        // layer.on( 'load', function () {
        //     if ( layer._currentImage )
        //         layer._currentImage.setZIndex( zIndex )
        // } )

        return mapImageLayer
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'kml', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    // SMK.TYPE.Layer[ 'kml' ].esri3d.create = function ( layers, zIndex ) {
    //     var self = this;

    //     if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

    //     var jsonLayer = L.geoJson( null, {
    //         style: convertStyle( layers[ 0 ].config.style ),
    //         coordsToLatLng: function ( xy ) {
    //             // if ( !layers[ 0 ].config.CRS ) return xy
    //             return L.CRS[ layers[ 0 ].config.CRS ].unproject( L.point( xy ) )
    //         },
    //         renderer: L.svg(),
    //         interactive: false
    //     } )

    //     if ( !layers[ 0 ].config.dataUrl )
    //         layers[ 0 ].config.dataUrl = '../smks-api/MapConfigurations/' + this.lmfId + '/Attachments/' + layers[ 0 ].config.id

    //     if ( !layers[ 0 ].config.CRS )
    //         layers[ 0 ].config.CRS = 'EPSG4326'

    //     var kmlLayer = omnivore.kml( layers[ 0 ].config.dataUrl, null, jsonLayer )

    //     var loadEvent = function () {
    //         kmlLayer.fire( 'load' )
    //     }
    //     kmlLayer.on( {
    //         add: loadEvent,
    //     } )
    //     self.map.on( {
    //         zoomend: loadEvent,
    //         moveend: loadEvent
    //     } )

    //     kmlLayer.on( {
    //         add: function () {
    //             kmlLayer.options.renderer._container.style.zIndex = zIndex
    //         }
    //     } )

    //     return SMK.UTIL.makePromise( function ( res, rej ) {
    //         kmlLayer.on( {
    //             'ready': function () {
    //                 console.log( 'loaded', layers[ 0 ].config.dataUrl )
    //                 res( kmlLayer )
    //             },
    //             'error': function () {
    //                 res()
    //             }
    //         } )
    //     } )
    // }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineLayerType( 'geojson', {

        getFeaturesAtPoint: getVectorFeaturesAtPoint

    } )

    // SMK.TYPE.Layer[ 'geojson' ].esri3d.create = function ( layers, zIndex ) {
    //     if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

    //     var layer = new L.geoJson( null, {
    //         style: convertStyle( layers[ 0 ].config.style ),
    //         coordsToLatLng: function ( xy ) {
    //             // if ( !layers[ 0 ].config.CRS ) return xy
    //             return L.CRS[ layers[ 0 ].config.CRS ].unproject( L.point( xy ) )
    //         },
    //         renderer: L.svg(),
    //         interactive: false
    //     } )

    //     var loadEvent = function () {
    //         layer.fire( 'load' )
    //     }
    //     layer.on( {
    //         add: loadEvent,
    //     } )
    //     this.map.on( {
    //         zoomend: loadEvent,
    //         moveend: loadEvent
    //     } )

    //     layer.on( {
    //         add: function () {
    //             layer.options.renderer._container.style.zIndex = zIndex
    //         }
    //     } )

    //     if ( !layers[ 0 ].config.dataUrl )
    //         layers[ 0 ].config.dataUrl = '../smks-api/MapConfigurations/' + this.lmfId + '/Attachments/' + layers[ 0 ].config.id

    //     if ( !layers[ 0 ].config.CRS )
    //         layers[ 0 ].config.CRS = 'EPSG4326'

    //     return $.get( layers[ 0 ].config.dataUrl, null, null, 'json' )
    //         .then( function ( data ) {
    //             console.log( 'loaded', layers[ 0 ].config.dataUrl )
    //             layer.addData( data )
    //             return layer
    //         } )
    // }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function convertStyle( styleConfig ) {
        return {
            // stroke:      true,
            color:       '#' + styleConfig.strokeColor,
            weight:      styleConfig.strokeWidth,
            opacity:     styleConfig.strokeOpacity,
            // lineCap:     styleConfig.,
            // lineJoin:    styleConfig.,
            // dashArray:   styleConfig.,
            // dashOffset:  styleConfig.,
            // fill:        styleConfig.,
            fillColor:   '#' + styleConfig.fillColor,
            fillOpacity: styleConfig.fillOpacity,
            // fillRule:    styleConfig.,
        }
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
