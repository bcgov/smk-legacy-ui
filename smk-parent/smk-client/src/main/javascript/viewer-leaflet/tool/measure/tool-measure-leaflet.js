include.module( 'tool-measure-leaflet', [ 'leaflet', 'tool-measure' ], function () {

    SMK.TYPE.MeasureTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.$viewer.map.createPane( 'hiddenPane', smk.addToContainer( '<div style="display:none"></div>' ) )

        this.control = L.control.measure( {
                position: 'topright',
                primaryLengthUnit: 'meters',
                secondaryLengthUnit: 'kilometers',
                primaryAreaUnit: 'hectares',
                secondaryAreaUnit: 'sqmeters',
                activeColor: '#38598a',
                completedColor: '#036',
                popupOptions: {
                    pane: 'hiddenPane'
                }
            } )

        this.control.addTo( smk.$viewer.map )

        this.control._layer.on( {
            'popupopen': function ( ev ) {
                console.log( ev )

            }
        } )

        this.changedActive( function () {
            if ( self.active ) {
                self.control._layer.addTo( smk.$viewer.map )
            }
            else {
                self.control._layer.removeFrom( smk.$viewer.map )
            }
        } )

        smk.on( this.id, {
            // 'activate': function () {
            //     if ( !self.visible || !self.enabled ) return

            //     self.active = !self.active
            // },

            'container-inserted': function ( ev ) {
                console.log( ev )

                $( ev.el ).append( self.control._container )
                self.control._expand()
            },
        } )
    } )

} )

