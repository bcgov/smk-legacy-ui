include.module( 'tool-select-leaflet', [ 'leaflet', 'tool-select' ], function ( inc ) {

    SMK.TYPE.SelectTool.prototype.styleFeature = function () {
        return {
            color:       '#00ffff',
            weight:      2,
            opacity:     0.7,
            fillColor:   '#00a5ff',
            fillOpacity: 0.1,
        }
    }

    SMK.TYPE.SelectTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.$viewer.selected.pickedFeature( function ( ev ) {
            if ( ev.feature ) {
                if ( !ev.feature.center ) {
                    var center = turf.centerOfMass( ev.feature.geometry )

                    if ( center.geometry )
                        ev.feature.center = L.GeoJSON.coordsToLatLng( center.geometry.coordinates )
                    else
                        ev.feature.center = L.GeoJSON.coordsToLatLng( center.coordinates )
                }

                self.popup
                    .setLatLng( ev.feature.center )
                    .openOn( smk.$viewer.map )
            }
        } )

        smk.$viewer.selected.zoomToFeature( function ( ev ) {
        } )

    } )

} )
