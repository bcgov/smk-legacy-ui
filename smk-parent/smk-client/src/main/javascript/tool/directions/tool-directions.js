include.module( 'tool-directions', [ 'smk', 'tool', 'widgets', 'tool-directions.panel-directions-html', 'tool-directions.popup-directions-html' ], function ( inc ) {

    var request

    function findRoute( points, option ) {
        if ( request )
            request.abort()

        var query = {
            points:     points.map( function ( w ) { return w.longitude + ',' + w.latitude } ).join( ',' ),
            outputSRS:  4326,
            criteria:   option.criteria,
            roundTrip:  option.roundTrip
        }

        return SMK.UTIL.makePromise( function ( res, rej ) {
            ( request = $.ajax( {
                timeout:    10 * 1000,
                dataType:   'json',
                url:        'https://routerdlv.api.gov.bc.ca/' + ( option.optimal ? 'optimalDirections' : 'directions' ) + '.json',
                data:       query,
                headers: {
                    apikey: 'ndLv6oEJN4z5FwwhDyaNoF4NfnYWXwVJ'
                }
            } ) ).then( res, rej )
        } )
        .then( function ( data ) {
            if ( !data.routeFound ) throw new Error( 'failed to find route' )

            return data
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Vue.component( 'directions-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'directions-panel', {
        template: inc[ 'tool-directions.panel-directions-html' ],
        props: [ 'busy', 'waypoints', 'directions', 'directionHighlight', 'directionPick', 'summary' ],
        data: function () {
            return {
                optimal:    false,
                roundTrip:  false,
                criteria:   'shortest'
            }
        },
        computed: {
            firstWaypointIndex: function () {
                for ( var i = 0; i < this.waypoints.length; i++ )
                    if ( this.waypoints[ i ].location )
                        return i
            },
            lastWaypointIndex: function () {
                for ( var i = this.waypoints.length - 1; i >= 0 ; i-- )
                    if ( this.waypoints[ i ].location )
                        return i
            },
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function DirectionsTool( option ) {
        this.makePropWidget( 'icon', 'directions_car' )

        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'waypoints', [] )
        this.makePropPanel( 'directions', [] )
        this.makePropPanel( 'directionHighlight', null )
        this.makePropPanel( 'directionPick', null )
        this.makePropPanel( 'summary', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          4,
            title:          'Directions',
            widgetComponent:'directions-widget',
            panelComponent: 'directions-panel',
        }, option ) )

        this.routeOption = {
            optimal:    false,
            roundTrip:  false,
            criteria:   'shortest'
        }
    }

    SMK.TYPE.DirectionsTool = DirectionsTool

    $.extend( DirectionsTool.prototype, SMK.TYPE.Tool.prototype )
    DirectionsTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    DirectionsTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        this.changedActive( function () {
            if ( self.active ) {
                if ( self.waypoints.length == 0 ) {
                    self.addWaypointCurrentLocation().then( function () {
                        self.addWaypoint()
                        self.displayWaypoints()
                    } )
                }
                else {
                    self.findRoute()
                }
            }
        } )

        this.getCurrentLocation = function () {
            return smk.$viewer.getCurrentLocation().then( function ( loc ) {
                return smk.$viewer.findNearestSite( loc ).then( function ( site ) {
                    return { location: loc, description: site.fullAddress }
                } )
            } )
        }

        smk.$viewer.handlePick( this, function ( location ) {
            return smk.$viewer.findNearestSite( location.map ).then( function ( site ) {
                var empty = self.waypoints.find( function ( w ) { return !w.location } )

                if ( !empty )
                    throw new Error( 'shouldnt happen' )

                empty.location = location.map
                empty.description = site.fullAddress
                self.addWaypoint()

                self.findRoute()
            } )
        } )

        aux.widget.vm.$on( 'directions-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        aux.panel.vm.$on( 'directions-panel.option', function ( ev, comp ) {
            self.routeOption.optimal = comp.optimal
            self.routeOption.roundTrip = comp.roundTrip
            self.routeOption.criteria = comp.criteria

            self.findRoute()
        } )

        aux.panel.vm.$on( 'directions-panel.reverse', function ( ev ) {
            self.waypoints.reverse()
            self.findRoute()
        } )

        aux.panel.vm.$on( 'directions-panel.clear', function ( ev ) {
            self.resetWaypoints()
            self.addWaypointCurrentLocation().then( function () {
                self.addWaypoint()
                self.displayWaypoints()
            } )
        } )

        aux.panel.vm.$on( 'directions-panel.hover-direction', function ( ev ) {
            self.directionHighlight = ev.highlight
        } )

        aux.panel.vm.$on( 'directions-panel.pick-direction', function ( ev ) {
            self.directionPick = ev.pick
        } )

        aux.panel.vm.$on( 'directions-panel.changed-waypoints', function ( ev ) {
            self.findRoute()
        } )

        aux.panel.vm.$on( 'directions-panel.zoom-waypoint', function ( ev ) {
        } )

        aux.panel.vm.$on( 'directions-panel.remove-waypoint', function ( ev ) {
            self.waypoints.splice( ev.index, 1 )

            self.findRoute()
        } )

    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    DirectionsTool.prototype.addWaypoint = function ( location, description ) {
        var wp = { location: null, description: null }

        if ( location )
            wp.location = { latitude: location.latitude, longitude: location.longitude }

        wp.description = description

        this.waypoints.push( wp )
    }

    DirectionsTool.prototype.addWaypointCurrentLocation = function () {
        var self = this

        this.busy = true

        return this.getCurrentLocation()
            .then( function ( res ) {
                self.addWaypoint( res.location, '(CURRENT) ' + res.description )
            } )
            .finally( function () {
                self.busy = false
            } )
    }

    DirectionsTool.prototype.resetWaypoints = function ( ) {
        var self = this

        this.waypoints = []
        this.directions = []
        this.directionHighlight = null
        this.directionPick = null
        this.summary = null
    }

    DirectionsTool.prototype.findRoute = function () {
        var self = this

        this.directions = []
        this.summary = null
        this.displayRoute()

        var points = this.waypoints
            .map( function ( w, i ) { return { index: i, latitude: w.location && w.location.latitude, longitude: w.location && w.location.longitude } } )
            .filter( function ( w ) { return !!w.latitude } )

        if ( points.length < 2 ) {
            self.displayWaypoints()
            return
        }
        // console.log( points )

        this.busy = true

        findRoute( points, this.routeOption ).then( function ( data ) {
            self.displayRoute( data.route )

            if ( data.visitOrder && data.visitOrder.findIndex( function ( v, i ) { return points[ v ].index != i } ) != -1 ) {
                // console.log( data.visitOrder )
                // console.log( data.visitOrder.map( function ( v ) { return points[ v ].index } ) )
                // console.log( JSON.stringify( self.waypoints, null, '  ' ) )

                self.waypoints = data.visitOrder.map( function ( v ) { return self.waypoints[ points[ v ].index ] } )
                // console.log( JSON.stringify( self.waypoints, null, '  ' ) )
                self.addWaypoint()
            }

            self.displayWaypoints()

            self.summary = 'Route travels ' + data.distance + ' km in ' + data.timeText

            self.directions = data.directions.map( function ( dir ) {
                dir.instruction = dir.text.replace( /\sfor\s(\d+.?\d*\sk?m)\s[(](\d+).+?((\d+).+)?$/, function ( m, a, b, c, d ) {
                    dir.distance = a
                    if ( d )
                        dir.time = ( '0' + b ).substr( -2 ) + ':' + ( '0' + d ).substr( -2 )
                    else
                        dir.time = '00:' + ( '0' + b ).substr( -2 )

                    return ''
                } )
                return dir
            } )
        } )
        .finally( function () {
            self.busy = false
        } )
    }

    return DirectionsTool
} )

