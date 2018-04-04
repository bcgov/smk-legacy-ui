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

} )
