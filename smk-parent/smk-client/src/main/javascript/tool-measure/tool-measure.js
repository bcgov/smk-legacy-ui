include.module( 'tool-measure', [ 'smk', 'tool' ], function () {

    function MeasureTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
        }, option ) )
    }

    SMK.TYPE.MeasureTool = MeasureTool

    $.extend( MeasureTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return MeasureTool

} )

