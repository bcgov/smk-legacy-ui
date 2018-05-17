include.module( 'tool-location-leaflet', [ 'leaflet', 'tool-location' ], function ( inc ) {

    SMK.TYPE.LocationTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        this.popup = L.popup( {
            maxWidth: 100,
            closeButton: false,
        } )
        .setContent( function () { return self.vm.$el } )

        this.locationMarker = L.marker()
            .bindPopup( this.popup )

        self.changedVisible( function () {
            if ( self.visible ) {
                self.locationMarker
                    .setLatLng( [ self.location.map.latitude, self.location.map.longitude ] )
                    .addTo( smk.$viewer.map )
                    .openPopup()
            }
            else {
                self.popup.remove()
                self.locationMarker.remove()
            }
        } )
    } )


} )
