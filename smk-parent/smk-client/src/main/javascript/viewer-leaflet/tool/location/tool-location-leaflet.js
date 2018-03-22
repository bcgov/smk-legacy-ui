include.module( 'tool-location-leaflet', [ 'leaflet', 'tool-location' ], function ( inc ) {

    SMK.TYPE.LocationTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.$viewer.locationMarker = L.marker( [0, 0], {
        } ).addTo( smk.$viewer.map )

        smk.$viewer.pickedLocation( function ( location ) {
            if ( !self.enabled ) return

            smk.$viewer.locationMarker.setLatLng( [ location.map.latitude, location.map.longitude ] )
        } )

        smk.$viewer.changedView( function () {
            smk.$viewer.locationMarker.setLatLng( [ 0, 0 ] )
        } )

        self.changedEnabled( function () {
            if ( !self.enabled )
                smk.$viewer.locationMarker.setLatLng( [ 0, 0 ] )
        } )
    } )

} )
