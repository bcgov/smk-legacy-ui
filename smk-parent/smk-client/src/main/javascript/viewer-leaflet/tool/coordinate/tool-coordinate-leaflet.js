include.module( 'tool-coordinate-leaflet', [ 'leaflet', 'tool-coordinate' ], function () {

    SMK.TYPE.CoordinateTool.prototype.afterInitialize.push( function ( smk ) {
        L.control
            .coordinates( {
                position:           "bottomright",
                decimals:           4,
                labelTemplateLat:   "<label>latitude<div>{y}</div></label>",
                labelTemplateLng:   "<label>longitude<div>{x}</div></label>",
                useDMS:             false,
                useLatLngOrder:     true,
                enableUserInput:    false,
            } )
            .addTo( smk.$viewer.map )
    } )

} )
