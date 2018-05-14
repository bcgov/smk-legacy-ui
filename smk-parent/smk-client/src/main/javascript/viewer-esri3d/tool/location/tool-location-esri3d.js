include.module( 'tool-location-esri3d', [ 'esri3d', 'types-esri3d', 'tool-location' ], function ( inc ) {

    var E = SMK.TYPE.Esri3d

    SMK.TYPE.LocationTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        this.updatePopup = function () {
            smk.$viewer.showPopup( self.vm.$el, this.location.map, { title: 'Location' } )
        }

        self.changedVisible( function () {
            if ( self.visible ) {
            }
            else {
                smk.$viewer.view.popup.close()
            }
        } )
    } )


} )
