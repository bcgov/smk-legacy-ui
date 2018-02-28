include.module( 'tool-pan-leaflet', [ 'tool-pan', 'leaflet' ], function () {

    SMK.TYPE.PanTool.prototype.afterInitialize.push( function ( smk ) {
        smk.$viewer.map.dragging.enable()
    } )

} )

