include.module( 'tool-scale-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk, option ) {
            if ( option.showBar )
                L.control
                    .betterscale( { imperial: false, metric: true } )
                    .addTo( smk.$viewer.map )

            if ( option.showFactor )
                L.control
                    .scalefactor()
                    .addTo( smk.$viewer.map )
        }
    }

} )

