include.module( 'util', [ 'event' ], function ( inc ) {

    Object.assign( window.SMK.UTIL, {
        makePromise: function( withFn ) {
            return new Promise( withFn || function () {} )
        },

        resolved: function() {
            return Promise.resolve.apply( Promise, arguments )
        },

        rejected: function() {
            return Promise.reject.apply( Promise, arguments )
        },

        waitAll: function ( promises ) {
            return Promise.all( promises )
        },

        makeRequest: function ( option ) {
            return new SMK.TYPE.Request( option )
        },
        // makeRequest: function ( option, toAbort ) {
        //     toAbort = toAbort || function () {}

        //     return this.makePromise( function ( res, rej ) {
        //         var xhr = $.ajax( option )
        //         xhr.then( res, rej )

        //         toAbort( function ( source ) {
        //             rej( new Error( 'aborted' + ( source ? ' by ' + source : '' ) ) )
        //             xhr.abort()
        //         } )
        //     } )
        // },

        type: function( val ) {
            var t = typeof val
            if ( t != 'object' ) return t
            if ( Array.isArray( val ) ) return 'array'
            if ( val === null ) return 'null'
            return 'object'
        },

        templatePattern: /<%=\s*(.*?)\s*%>/g,
        templateReplace: function ( template, replacer ) {
            if ( !replacer ) return template

            var m = template.match( this.templatePattern );
            if ( !m ) return template;

            replacer = ( function ( inner ) {
                return function ( param, match ) {
                    var r = inner.apply( null, arguments )
                    return r == null ? match : r
                }
            } )( replacer )

            if ( m.length == 1 && m[ 0 ] == template ) {
                var x = this.templatePattern.exec( template );
                return replacer( x[ 1 ], template )
            }

            return template.replace( this.templatePattern, function ( match, parameterName ) {
                return replacer( parameterName, match )
            } )
        },

        isDeepEqual: function( a, b ) {
            var at = this.type( a );
            var bt = this.type( b );

            if ( at != bt ) return false;

            switch ( at ) {
            case 'array':
                if ( a.length != b.length ) return false;

                for ( var i = 0; i < a.length; i++ )
                    if ( !SMK.UTIL.isDeepEqual( a[ i ], b[ i ] ) )
                        return false

                return true;

            case 'object':
                var ak = Object.keys( a ).sort();
                var bk = Object.keys( b ).sort();

                if ( !SMK.UTIL.isDeepEqual( ak, bk ) )
                    return false

                for ( var i = 0; i < ak.length; i++ )
                    if ( !SMK.UTIL.isDeepEqual( a[ ak[ i ] ], b[ ak[ i ] ] ) )
                        return false

                return true;

            case 'string':
                return a == b;

            default:
                return String( a ) == String( b )
            }

            throw new Error( 'not supposed to be here' )
        },

        grammaticalNumber: function ( num, zero, one, many ) {
            if ( one == null ) one = zero
            if ( many == null ) many = one
            switch ( num ) {
                case 0: return zero == null ? '' : zero.replace( '{}', num )
                case 1: return one == null ? '' : one.replace( '{}', num )
                default: return many == null ? '' : many.replace( '{}', num )
            }
        },

        extractCRS: function ( obj ) {
            if ( obj.properties )
                if ( obj.properties.name )
                    return obj.properties.name

            throw new Error( 'unable to determine CRS from: ' + JSON.stringify( obj ) )
        },

        reproject: function ( geojson, crs ) {
            var self = this

            return include( 'proj4' ).then( function ( inc ) {
                var proj = proj4( self.extractCRS( crs ) )

                return self.traverse.GeoJSON( geojson, {
                    coordinate: function ( c ) {
                        return proj.inverse( c )
                    }
                } )
            } )
        },

        traverse: {
            GeoJSON: function ( geojson, cb ) {
                Object.assign( {
                    coordinate: function ( c ) { return c }
                }, cb )

                return this[ geojson.type ]( geojson, cb )
            },

            Point: function ( obj, cb ) {
                return {
                    type: 'Point',
                    coordinates: cb.coordinate( obj.coordinates )
                }
            },

            MultiPoint: function ( obj, cb ) {
                return {
                    type: 'MultiPoint',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                }
            },

            LineString: function ( obj, cb ) {
                return {
                    type: 'LineString',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                }
            },

            MultiLineString: function ( obj, cb ) {
                return {
                    type: 'MultiLineString',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                }
            },

            Polygon: function ( obj, cb ) {
                return {
                    type: 'Polygon',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                }
            },

            MultiPolygon: function ( obj, cb ) {
                return {
                    type: 'MultiPolygon',
                    coordinates: obj.coordinates.map( function ( ps ) { return ps.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } ) } )
                }
            },

            GeometryCollection: function ( obj, cb ) {
                var self = this
                return {
                    type: 'GeometryCollection',
                    geometries: obj.geometries.map( function ( g ) { return self[ g.type ]( g, cb ) } )
                }
            },

            FeatureCollection:  function ( obj, cb ) {
                var self = this
                return {
                    type: 'FeatureCollection',
                    features: obj.features.map( function ( f ) { return self[ f.type ]( f, cb ) } )
                }
            },

            Feature: function( obj, cb ) {
                return {
                    type: 'Feature',
                    geometry: this[ obj.geometry.type ]( obj.geometry, cb ),
                    properties: obj.properties
                }
            }
        },

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var RequestEvent = SMK.TYPE.Event.define( [
        'changedState'
    ] )

    function Request( option ) {
        var self = this

        RequestEvent.prototype.constructor.call( this )

        this.$option = option
        this.abort = function () { this.state = 'aborted' }

        var state
        Object.defineProperty( this, 'state', {
            get: function () { return state },
            set: function ( v ) {
                if ( v == state ) return
                if ( state == 'aborted' ) return
                // console.log( self.config.id, v )
                state = v
                self.changedState()
            }
        } )

        this.state = 'pending'
    }

    Object.assign( Request.prototype, RequestEvent.prototype )
    SMK.TYPE.Request = Request

    Request.prototype.start = function ( onResult ) {
        var self = this

        if ( this.$promise ) return this
        if ( this.state == 'aborted' ) return this

        this.$promise = SMK.UTIL.makePromise( function ( res, rej ) {
            self.state = 'requesting'

            var xhr = $.ajax( self.$option )
            xhr.then( res, rej )

            self.changedState( function () {
                if ( self.state != 'aborted' ) return

                rej( new Error( 'aborted' ) )
                xhr.abort()
            } )
        } )
        .then( function ( data ) {
            if ( onResult )
                return onResult( data )

            return data
        } )

        this.$promise
            .then( function ( data ) {
                self.state = 'succeeded'
                return data
            } )
            .catch( function ( err ) {
                self.state = 'failed'
                console.warn( err )
            } )

        return this
    }

    Request.prototype.result = function () {
        if ( !this.$promise ) throw new Error( 'request not started' )
        return this.$promise
    }

} )