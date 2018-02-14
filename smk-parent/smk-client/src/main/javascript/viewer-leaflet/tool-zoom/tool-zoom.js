include.module( 'tool-zoom-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk, option ) {
            if ( option.mouseWheel ) {
                smk.$viewer.map.scrollWheelZoom.enable()
            }

            if ( option.doubleClick ) {
                smk.$viewer.map.doubleClickZoom.enable()
            }

            if ( option.box ) {
                smk.$viewer.map.boxZoom.enable()
            }

            if ( option.control ) {
                L.control.zoom().addTo( smk.$viewer.map )
            }
        }
    }

} )

