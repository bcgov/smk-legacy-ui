include.module( 'tool-measure-esri3d', [ 'tool-measure', 'esri3d', 'types-esri3d', 'util-esri3d' ], function () {

    var E = SMK.TYPE.Esri3d

    SMK.TYPE.MeasureTool.prototype.afterInitialize.push( function ( smk ) {
        // this.changedActive( function () {
        //     if ( self.active ) {
        //         self.widget = new DirectLineMeasurement3D( {
        //             view:       self.view,
        //             container:
        //         } )
        //         smk.withTool( 'location', function () { this.active = false } )

        //         if ( self.waypoints.length == 0 ) {
        //             self.activating = self.activating.then( function () {
        //                 return self.startAtCurrentLocation()
        //             } )
        //         }
        //         else {
        //             self.activating = self.activating.then( function () {
        //                 return self.findRoute()
        //             } )
        //         }
        //     }
        //     else {
        //         smk.withTool( 'location', function () { this.active = true } )
        //     }
        // } )

        smk.on( this.id, {
            // 'activate': function () {
            //     if ( !self.visible || !self.enabled ) return

            //     self.active = !self.active
            // },

            'container-inserted': function ( ev ) {
                console.log( ev )

                self.widget = new E.widgets.DirectLineMeasurement3D( {
                    view:       smk.$viewer.view,
                    container:  ev.el
                } )

            },

            'container-unbind': function ( ev ) {
                console.log( ev )
                self.widget.destroy()
            }
        } )

    } )

} )

