include.module( 'tool-location-leaflet', [ 'leaflet', 'tool-location' ], function ( inc ) {

    SMK.TYPE.LocationTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        this.popup = L.popup( {
            maxWidth: 100,
            offset: [ 0, -10 ]
        } )
        .setContent( function () { return self.vm.$el } )

        var locationMarker = L.marker()
            .bindPopup( this.popup )
        
        smk.$viewer.pickedLocation( function ( location ) {
            if ( !self.enabled ) return

            locationMarker
                .setLatLng( [ location.map.latitude, location.map.longitude ] )
                .addTo( smk.$viewer.map )
                .openPopup()
        } )

        smk.$viewer.changedView( function () {
            smk.$viewer.map.removeLayer( locationMarker )
        } )

        self.changedEnabled( function () {
            if ( !self.enabled )
                smk.$viewer.map.removeLayer( locationMarker )
        } )
    } )

} )
