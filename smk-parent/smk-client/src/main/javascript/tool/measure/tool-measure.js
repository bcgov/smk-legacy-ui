include.module( 'tool-measure', [ 'tool' ], function () {

    function MeasureTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
        }, option ) )
    }

    SMK.TYPE.MeasureTool = MeasureTool

    $.extend( MeasureTool.prototype, SMK.TYPE.Tool.prototype )
    MeasureTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return MeasureTool

} )

