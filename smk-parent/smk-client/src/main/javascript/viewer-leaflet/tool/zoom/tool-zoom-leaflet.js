include.module( 'tool-zoom-leaflet', [ 'tool-zoom', 'leaflet' ], function () {

    SMK.TYPE.ZoomTool.prototype.afterInitialize.push( function ( smk ) {
        if ( this.mouseWheel ) {
            smk.$viewer.map.scrollWheelZoom.enable()
        }

        if ( this.doubleClick ) {
            smk.$viewer.map.doubleClickZoom.enable()
        }

        if ( this.box ) {
            smk.$viewer.map.boxZoom.enable()
        }

        if ( this.control ) {
            L.control.zoom().addTo( smk.$viewer.map )
        }
    } )

} )

