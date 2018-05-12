include.module( 'tool-location', [ 'tool', 'widgets', 'tool-location.popup-location-html' ], function ( inc ) {

    function LocationTool( option ) {
        this.makePropWidget( 'site', {} )
        this.makePropWidget( 'tool', {} )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            title:          'Location',
        }, option ) )
    }

    SMK.TYPE.LocationTool = LocationTool

    $.extend( LocationTool.prototype, SMK.TYPE.Tool.prototype )
    LocationTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LocationTool.prototype.afterInitialize.push( function ( smk ) {
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
                identifyFeatures: function () {
                    var site = self.site
                    self.reset()
                    smk.$viewer.identifyFeatures( self.location )
                },
                startMeasurement: function () {

                },
                startDirections: function () {
                    var site = self.site
                    self.reset()
                    smk.$tool.directions.active = true

                    smk.$tool.directions.activating
                        .then( function () {
                            return smk.$tool.directions.startAtCurrentLocation()
                        } )
                        .then( function () {
                            return smk.$tool.directions.addWaypoint( site )
                        } )
                },
            },
            updated: function () {
                self.updatePopup()
            }
        } )

        this.updatePopup = function () {}

        smk.$viewer.handlePick( this, function ( location ) {
            self.reset()

            self.setLocation( location )

            SMK.UTIL.findNearestSite( location.map )
                .then( function ( site ) {
                    self.site = site
                } )
                .catch( function ( err ) {
                    self.site = location.map
                } )
        } )

        this.setLocation = function ( location ) {
            this.location = location
        }

        this.reset = function () {
            this.site = {}
        }

        smk.$viewer.changedView( function () {
            self.reset()
        } )

        self.changedActive( function () {
            if ( !self.active )
                self.reset()
        } )

        self.active = true
    } )

    LocationTool.prototype.hasPickPriority = function () {
        return true
    }

    return LocationTool
} )
