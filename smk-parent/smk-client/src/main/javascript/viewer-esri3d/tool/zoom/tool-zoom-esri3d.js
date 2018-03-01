include.module( 'tool-zoom-esri3d', [ 'tool-zoom', 'esri3d' ], function () {

    SMK.TYPE.ZoomTool.prototype.afterInitialize.push( function ( smk ) {

        if ( this.mouseWheel ) {
            smk.$viewer.zoomHandler.mouseWheel.remove()
        }

        if ( this.doubleClick ) {
            smk.$viewer.zoomHandler.doubleClick1.remove()
            smk.$viewer.zoomHandler.doubleClick2.remove()
        }

        if ( this.box ) {
            smk.$viewer.zoomHandler.drag1.remove()
            smk.$viewer.zoomHandler.drag2.remove()
        }

        if ( this.control ) {
            smk.$viewer.zoomHandler.keyDown.remove()
            smk.$viewer.view.ui.add( [
                {
                    component: new SMK.TYPE.Esri3d.widgets.Zoom( { view: smk.$viewer.view } ),
                    position: 'top-right'
                }
            ] )
        }
    } )

} )

