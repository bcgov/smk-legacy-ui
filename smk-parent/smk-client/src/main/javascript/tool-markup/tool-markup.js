include.module( 'tool-markup', [ 'smk', 'tool' ], function () {

    function MarkupTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
        }, option ) )
    }

    SMK.TYPE.MarkupTool = MarkupTool

    $.extend( MarkupTool.prototype, SMK.TYPE.Tool.prototype )
    MarkupTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return MarkupTool

} )

