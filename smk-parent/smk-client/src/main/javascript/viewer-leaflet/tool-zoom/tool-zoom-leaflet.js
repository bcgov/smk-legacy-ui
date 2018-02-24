include.module( 'tool-zoom-leaflet', [ 'tool-zoom', 'leaflet' ], function () {

    // function ZoomTool( option ) {
    //     SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
    //     }, option ) )
    // }

    // SMK.TYPE.ZoomTool = ZoomTool

    // $.extend( ZoomTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.ZoomTool.prototype.afterInitialize = function ( smk ) {
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
    }

    // return ZoomTool

} )

