include.module( 'tool-identify-leaflet', [ 'leaflet', 'tool-identify', 'feature-list-clustering-leaflet' ], function ( inc ) {

    SMK.TYPE.IdentifyTool.prototype.styleFeature = function () {
        var self = this
        return function () {
            return Object.assign( {
                color:       'black',
                weight:      3,
                opacity:     0.8,
                fillColor:   'white',
                fillOpacity: 0.5,
            }, self.style )
        }
    }

    SMK.TYPE.IdentifyTool.prototype.afterInitialize.push( inc[ 'feature-list-clustering-leaflet' ] )

} )
