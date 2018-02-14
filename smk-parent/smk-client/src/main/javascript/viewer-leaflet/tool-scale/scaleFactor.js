include.module( 'tool-scaleFactor-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk ) {
            L.control
                .scalefactor()
                .addTo( smk.$viewer.map )
        }
    }

} )
