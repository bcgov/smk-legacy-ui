include.module( 'layer-esri3d.layer-vector-esri3d-js', [ 'layer.layer-vector-js', 'types-esri3d', 'util-esri3d' ], function () {

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
                graphics: SMK.UTIL.geoJsonToEsriGeometry( geojson, SMK.UTIL.smkStyleToEsriSymbol( layers[ 0 ].config.style ) )
            } )
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
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
