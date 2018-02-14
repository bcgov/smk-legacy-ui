include.module( 'tool-minimap-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk ) {
            ( new L.Control.MiniMap( L.esri.basemapLayer( "Topographic", { detectRetina: true } ), { toggleDisplay: true } ) )
                .addTo( smk.$viewer.map );
        }
    }

} )
