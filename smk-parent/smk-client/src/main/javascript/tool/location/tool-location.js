include.module( 'tool-location', [ 'smk', 'tool', 'widgets', 'tool-location.popup-location-html' ], function ( inc ) {

    function LocationTool( option ) {
        this.makePropWidget( 'location', {} )
        this.makePropWidget( 'site', {} )
        this.makePropWidget( 'tool', {} )

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

        if ( smk.$tool.identify )
            this.tool.identify = true

        // if ( smk.$tool.measure )
        //     this.tool.measure = true

        if ( smk.$tool.directions )
            this.tool.directions = true

        this.vm = new Vue( {
            el: smk.addToOverlay( inc[ 'tool-location.popup-location-html' ] ),
            data: this.widget,
            methods: {
                formatDD: function ( dd ) {
                    return dd.toFixed( 4 )
                },
                identifyFeatures: function ( location ) {
                    smk.$viewer.identifyFeatures( location )
                },
                startMeasurement: function ( location ) {

                },
                startDirections: function ( location, site ) {
                    smk.$tool.directions.active = true

                    smk.$tool.directions.activating.then( function () {
                        return smk.$tool.directions.startAtCurrentLocation( location.map, site.fullAddress )
                    } )
                },
            }
        } )

        smk.$viewer.pickedLocation( function ( location ) {
            if ( !self.enabled ) return

            self.location = location
            self.site = {}

            smk.$viewer.findNearestSite( location.map ).then( function ( site ) {
                self.site = site
            } )
            .catch( function ( err ) {
                // console.warn( err )
            } )
        } )

        smk.$viewer.changedView( function () {
            self.location = {}
        } )

        self.changedEnabled( function () {
            if ( !self.enabled )
                self.location = {}
        } )

    } )

    LocationTool.prototype.reset = function () {
        this.location = {}        
    }
    
    return LocationTool
} )
