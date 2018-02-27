include.module( 'tool-scale-leaflet', [ 'smk', 'leaflet' ], function () {

    SMK.TYPE.ScaleTool.prototype.afterInitialize.push( function ( smk ) {
        if ( this.showBar )
            L.control
                .betterscale( { imperial: false, metric: true } )
                .addTo( smk.$viewer.map )

        if ( this.showFactor )
            L.control
                .scalefactor()
                .addTo( smk.$viewer.map )
    } )    

} )

