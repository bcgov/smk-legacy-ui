include.module( 'tool-measure-leaflet', [ 'leaflet', 'tool-measure' ], function () {

    SMK.TYPE.MeasureTool.prototype.afterInitialize.push( function ( smk ) {
        L.control
            .measure( {
                position: 'topleft',
                primaryLengthUnit: 'meters',
                secondaryLengthUnit: 'kilometers',
                primaryAreaUnit: 'hectares',
                secondaryAreaUnit: 'sqmeters',
                activeColor: '#38598a',
                completedColor: '#036'
            } )
            .addTo( smk.$viewer.map )
    } )

} )

