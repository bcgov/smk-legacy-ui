include.module( 'tool-identify-leaflet', [ 'leaflet', 'tool-identify' ], function ( inc ) {

    SMK.TYPE.IdentifyTool.prototype.styleFeature = function () {
        return {
            color:       '#ffff00',
            weight:      2,
            opacity:     0.7,
            fillColor:   '#ffa500',
            fillOpacity: 0.1,
        }
    }

} )
