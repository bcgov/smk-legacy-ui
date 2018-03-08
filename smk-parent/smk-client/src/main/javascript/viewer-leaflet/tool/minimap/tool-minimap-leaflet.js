include.module( 'tool-minimap-leaflet', [ 'leaflet', 'tool-minimap' ], function () {

    SMK.TYPE.MinimapTool.prototype.afterInitialize.push( function ( smk ) {
        var ly = smk.$viewer.createBasemapLayer( this.baseMap || "Topographic" );

        ( new L.Control.MiniMap( ly[ 0 ], { toggleDisplay: true } ) )
            .addTo( smk.$viewer.map );
    } )

} )
