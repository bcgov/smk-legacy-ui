include.module( 'tool-scale-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk ) {
            L.control
                .betterscale( { imperial: false, metric: true } )
                .addTo( smk.$viewer.map )
        }
    }

} )

