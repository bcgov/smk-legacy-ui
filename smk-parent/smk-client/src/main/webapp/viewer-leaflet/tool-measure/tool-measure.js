include.module( 'tool-measure-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk ) {
            L.control
                .measure( {
                    position: 'topleft',
                    primaryLengthUnit: 'meters',
                    secondaryLengthUnit: 'kilometers',
                    primaryAreaUnit: 'hectares',
                    secondaryAreaUnit: 'sqmeters',
                    activeColor: '#38598a',
                    completedColor: '#036'
                } )
                .addTo( smk.$viewer.map )
        }
    }

} )

