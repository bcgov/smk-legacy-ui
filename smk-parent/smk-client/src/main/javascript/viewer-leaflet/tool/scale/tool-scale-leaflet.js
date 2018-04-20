include.module( 'tool-scale-leaflet', [ 'tool-scale', 'leaflet' ], function () {

    SMK.TYPE.ScaleTool.prototype.afterInitialize.push( function ( smk ) {
        if ( this.showBar !== false )
            L.control
                .betterscale( {
                    position: 'bottomright',
                    maxWidth: 180,
                    imperial: false,
                    metric: true
                } )
                .addTo( smk.$viewer.map )

        if ( this.showFactor !== false )
            L.control
                .scalefactor( {
                    position: 'bottomright',
                } )
                .addTo( smk.$viewer.map )
    } )

} )

