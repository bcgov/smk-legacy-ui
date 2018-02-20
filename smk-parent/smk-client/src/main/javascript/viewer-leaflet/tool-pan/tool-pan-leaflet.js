include.module( 'tool-pan-leaflet', [ 'smk', 'tool', 'leaflet' ], function () {

    // return {
    //     order: 1,
    //     initialize: function ( smk, option ) {
    //         smk.$viewer.map.dragging.enable()
    //     }
    // }

    function PanTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            // id: 'pan',
            order: 1
        }, option ) )
    }

    SMK.TYPE.PanTool = PanTool

    $.extend( PanTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    PanTool.prototype.initialize = function ( smk ) {
        smk.$viewer.map.dragging.enable()

        return SMK.TYPE.Tool.prototype.initialize.apply( this, arguments )
    }

    return PanTool

} )

