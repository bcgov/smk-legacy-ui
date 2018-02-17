include.module( 'tool-pan-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk, option ) {
            smk.$viewer.map.dragging.enable()
        }
    }

} )

