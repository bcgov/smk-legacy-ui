include.module( 'tool-location', [ 'smk', 'tool', 'widgets', 'tool-location.popup-location-html' ], function ( inc ) {

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function LocationTool( option ) {
        var el = smk.addToOverlay( inc[ 'tool-location.popup-location-html' ] )

        this.makePropWidget( 'coordinate', {} )
        this.makePropWidget( 'street', {} )
        this.makePropWidget( 'city', {} )
        
        this.vm = new Vue( {
            el: el,
            data: this.widget,
        } )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            // order:          4,
            title:          'Location',
            // widgetComponent:'identify-widget',
            // panelComponent: 'identify-panel',
        }, option ) )
    }

    SMK.TYPE.LocationTool = LocationTool

    $.extend( LocationTool.prototype, SMK.TYPE.Tool.prototype )
    LocationTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LocationTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        smk.$viewer.pickedLocation( function ( location ) {
            self.coordinate = location.map
        } )
        
    } )

    return LocationTool
} )
