include.module( 'tool-coordinate', [ 'smk', 'tool' ], function () {

    function CoordinateTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
        }, option ) )
    }

    SMK.TYPE.CoordinateTool = CoordinateTool

    $.extend( CoordinateTool.prototype, SMK.TYPE.Tool.prototype )
    CoordinateTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return CoordinateTool

} )

