include.module( 'tool-location-leaflet', [ 'leaflet', 'tool-location' ], function ( inc ) {

    SMK.TYPE.LocationTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        var locationMarker = L.marker( [0, 0], {
        } )

        smk.$viewer.pickedLocation( function ( location ) {
            if ( !self.enabled ) return

            locationMarker
                .setLatLng( [ location.map.latitude, location.map.longitude ] )
                .addTo( smk.$viewer.map )
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
