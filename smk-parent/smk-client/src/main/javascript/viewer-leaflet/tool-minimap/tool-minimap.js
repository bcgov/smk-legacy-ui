include.module( 'tool-minimap-leaflet', [ 'smk', 'leaflet' ], function () {

    return {
        order: 1,
        initialize: function ( smk, option ) {
            var ly = smk.$viewer.createBasemapLayer( option.baseMap || "Topographic" );

            ( new L.Control.MiniMap( ly.features, { toggleDisplay: true } ) )
                .addTo( smk.$viewer.map );
        }
    }

} )
