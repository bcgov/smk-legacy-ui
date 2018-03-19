include.module( 'tool-location', [ 'smk', 'tool', 'widgets', 'tool-location.popup-location-html' ], function ( inc ) {

    var request

    function findNearestSite( location ) {
        if ( request )
            request.abort()

        var query = {
            point:              [ location.map.longitude, location.map.latitude ].join( ',' ),
            outputSRS:          4326,
            locationDescriptor: 'routingPoint',
            maxDistance:        1000,
        }

        return SMK.UTIL.makePromise( function ( res, rej ) {
            ( request = $.ajax( {
                timeout:    10 * 1000,
                dataType:   'jsonp',
                url:        'https://geocoder.api.gov.bc.ca/sites/nearest.geojsonp',
                data:       query,
            } ) ).then( res, rej )
        } )
        .then( function ( data ) {
            return data.properties
        } )
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function LocationTool( option ) {
        this.makePropWidget( 'coordinate', {} )
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

        if ( smk.$tool.measure )
            this.tool.measure = true 

        if ( smk.$tool.directions )
            this.tool.directions = true 
            
        var el = smk.addToOverlay( inc[ 'tool-location.popup-location-html' ] )

        this.vm = new Vue( {
            el: el,
            data: this.widget,
            methods: {
                formatDD: function ( dd ) {
                    return dd.toFixed( 4 )
                },
                identifyFeatures: function ( location ) {

                },
                startMeasurement: function ( location ) {

                },
                startDirections: function ( location, site ) {
                    return smk.$viewer.getCurrentLocation().then( function ( curLoc ) {
                        return findNearestSite( curLoc ).then( function ( curSite ) {
                            smk.$tool.directions.start( [
                                { location: curLoc, site: curSite },
                                { location: location, site: site }
                            ] )    
                        } )
                    } )
                },
            }
        } )

        smk.$viewer.pickedLocation( function ( location ) {
            self.coordinate = location.map
            self.site = {}

            findNearestSite( location ).then( function ( site ) {
                // console.log( JSON.stringify( site, null, '  ' ) )
                self.site = site
            } )
            .catch( function ( err ) {
                console.warn( err )
            } )

        } )

        smk.$viewer.changedView( function () {
            self.coordinate = {}
        } )

    } )

    return LocationTool
} )
