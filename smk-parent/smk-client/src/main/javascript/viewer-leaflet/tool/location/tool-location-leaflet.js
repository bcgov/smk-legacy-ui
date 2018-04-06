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

        smk.$viewer.pickedLocation( function ( location ) {
            if ( !self.enabled ) return

            self.locationMarker
                .setLatLng( [ location.map.latitude, location.map.longitude ] )
                .addTo( smk.$viewer.map )
                .openPopup()
        } )

        smk.$viewer.changedView( function () {
            self.reset()
        } )

        self.changedEnabled( function () {
            if ( !self.enabled )
                self.reset()
        } )
    } )

    SMK.TYPE.LocationTool.prototype.reset = function () {
        this.popup.remove()
        this.locationMarker.remove()
        this.location = {}
    }

} )
