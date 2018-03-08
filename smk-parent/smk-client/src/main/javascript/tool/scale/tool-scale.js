include.module( 'tool-scale', [ 'smk', 'tool' ], function () {

    function ScaleTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
        }, option ) )
    }

    SMK.TYPE.ScaleTool = ScaleTool

    $.extend( ScaleTool.prototype, SMK.TYPE.Tool.prototype )
    ScaleTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return ScaleTool

} )
