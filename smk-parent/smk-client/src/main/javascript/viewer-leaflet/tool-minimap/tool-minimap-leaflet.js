include.module( 'tool-minimap-leaflet', [ 'smk', 'leaflet' ], function () {

    SMK.TYPE.MinimapTool.prototype.afterInitialize.push( function ( smk ) {
        var ly = smk.$viewer.createBasemapLayer( option.baseMap || "Topographic" );

        ( new L.Control.MiniMap( ly.features, { toggleDisplay: true } ) )
            .addTo( smk.$viewer.map );
    } )    

} )
