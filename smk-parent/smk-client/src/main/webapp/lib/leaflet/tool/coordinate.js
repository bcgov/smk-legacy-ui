include.module( 'tool-coordinate-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk ) {
            L.control
                .coordinates( {
                    position:           "bottomleft",
                    decimals:           4,
                    labelTemplateLat:   "Lat: {y}",
                    labelTemplateLng:   "Long: {x}",
                    useDMS:             false,
                    useLatLngOrder:     false
                } )
                .addTo( smk.$viewer.map )
        }
    }

} )
