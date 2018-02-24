include.module( 'tool-pan-leaflet', [ 'tool-pan', 'leaflet' ], function () {

    // function PanTool( option ) {
    //     SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
    //     }, option ) )
    // }

    // SMK.TYPE.PanTool = PanTool

    // $.extend( PanTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.PanTool.prototype.afterInitialize = function ( smk ) {
        smk.$viewer.map.dragging.enable()
    }

    // return PanTool

} )

