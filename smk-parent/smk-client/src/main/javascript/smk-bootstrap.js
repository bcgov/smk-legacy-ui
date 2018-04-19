( function () {

    polyfills()

    if ( !window.SMK ) window.SMK = {}

    window.SMK = Object.assign( {
        MAP: {},
        VIEWER: {},
        TYPE: {},
        UTIL: {},
        BOOT: Promise.resolve(),
        CONFIG: {
            surround: {
                type: "default",
                title: 'Simple Map Kit'
            },
            viewer: {
                type: "leaflet",
                location: {
                    extent: [ -139.1782, 47.6039, -110.3533, 60.5939 ],
                    zoom: 5,
                },
                baseMap: 'Topographic',
            },
            tools: [
                {
                    type: "search",
                    enabled: true,
                },
                {
                    type: "directions",
                    enabled: true,
                },
                {
                    type: "markup",
                    enabled: true,
                }
            ]
        }
    }, window.SMK )

    window.SMK.BOOT = window.SMK.BOOT
        .then( parseScriptElement )
        .then( resolveConfig )
        .then( loadInclude )
        .then( initializeSMK )
        .catch( function ( e ) {
            console.error( e )

            var message = document.createElement( 'div' )
            message.innerHTML = '\
                <div style="\
                    display:flex;\
                    flex-direction:column;\
                    justify-content:center;\
                    align-items:center;\
                    border: 5px solid red;\
                    padding: 20px;\
                    margin: 20px;\
                    position: absolute;\
                    top: 0;\
                    left: 0;\
                    right: 0;\
                    bottom: 0;\
                ">\
                    <h1>SMK Client</h1>\
                    <h2>Initialization failed</h2>\
                    <pre>{}</pre>\
                </div>\
            '.replace( /\s+/g, ' ' ).replace( '{}', e.stack )

            document.querySelector( 'body' ).appendChild( message )
        } )

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function parseScriptElement() {
        var script = document.currentScript

        var smkAttr = {
            'container-id': attrString( 'smk-map-frame' ),
            'config':       attrList( '?smk' ),
            'standalone':   attrBoolean( false, true ),
            'disconnected': attrBoolean( false, true ),
            'base-url':     attrString( ( new URL( script.src.replace( 'smk-bootstrap.js', '' ), document.location ) ).toString() ),
        }

        Object.keys( smkAttr ).forEach( function ( k ) {
            smkAttr[ k ] = smkAttr[ k ]( 'smk-' + k, script )
        } )

        console.log( 'SMK attributes', smkAttr )

        return Promise.resolve( smkAttr )

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        function attrString( missingKey, missingValue ) {
            if ( missingValue === undefined )
                missingValue = missingKey

            return function( key, el ) {
                var val = el.attributes[ key ]
                if ( val == null ) return missingKey
                if ( !val.value ) return missingValue
                return val.value
            }
        }

        function attrList( Default ) {
            return function( key, el ) {
                var val = attrString( Default )( key, el )
                // if ( val == null ) return []
                return val.split( /\s*[|]\s*/ ).filter( function ( i ) { return !!i } )
            }
        }

        function attrBoolean( missingKey, missingValue ) {
            return function( key, el ) {
                var val = attrString( missingKey, missingValue )( key, el )
                return !!eval( val )
            }
        }
    }

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function resolveConfig( attr ) {
        console.log( attr.config )

        var configs = []
        attr.config.forEach( function ( c ) {
            configs = configs.concat( parseConfig( c ) )
        } )

        attr.config = configs
        console.log( attr.config )

        return attr
    }

    function parseConfig( config ) {
        for ( var i in configParsers )
            if ( configParsers[ i ][ 0 ].test( config ) )
                return configParsers[ i ][ 1 ]( config )
    }

    var configParsers = [
        [ /^[?]/, function ( config ) {
            var paramPattern = new RegExp( '^' + config.substr( 1 ) + '([-].+)$', 'i' )

            var params = location.search.substr( 1 ).split( '&' )
            var configs = []
            params.forEach( function ( p ) {
                var m = decodeURIComponent( p ).match( paramPattern )
                if ( !m ) return

                configs = configs.concat( parseConfig( m[ 1 ] ) )
            } )

            return configs
        } ],

        [ /^[{].+[}]$/, function ( config ) {
            return JSON.parse( config )
        } ],

        [ /^[-].+$/, function ( config ) {
            var m = config.match( /^[-](.+?)([=](.+))?$/ )
            if ( !m ) return []

            var option = m[ 1 ].toLowerCase()
            if ( !( option in configHandler ) ) return []

            return configHandler[ option ]( m[ 3 ] )
        } ],

        [ /.+/, function ( config ) {
            return config
        } ]
    ]

    var configHandler = {
        'config': function ( arg ) {
            if ( /^[?-]/.test( arg ) )
                throw new Error( '-config argument cannot start with ? or -' )

            return parseConfig( arg )
        },

        'extent': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 4 ) throw new Error( '-extent needs 4 arguments' )
            return {
                viewer: {
                    location: {
                        extent: args
                    }
                }
            }
        },

        'center': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 2 || args.length > 3 ) throw new Error( '-center needs 2 or 3 arguments' )
            return {
                viewer: {
                    location: {
                        center: [ args[ 0 ], args[ 1 ] ],
                        zoom: args[ 2 ] || SMK.CONFIG.viewer.location.zoom
                    }
                }
            }
        },

        'viewer': function ( arg ) {
            return {
                viewer: {
                    type: arg
                }
            }
        },

        'active-tool': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 1 && args.length != 2 ) throw new Error( '-active-tool needs 1 or 2 arguments' )

            var toolId = args[ 0 ]
            if ( args[ 1 ] )
                toolId += '--' + args[ 1 ]

            return {
                viewer: {
                    activeTool: toolId
                }
            }
        }
    }

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function loadInclude( attr ) {
        return new Promise( function ( res, rej ) {
            if ( window.include ) return res( attr )

            var el = document.createElement( 'script' )

            el.addEventListener( 'load', function( ev ) {
                include.option( { baseUrl: attr[ 'base-url' ] } )

                res( attr )
            } )

            el.addEventListener( 'error', function( ev ) {
                rej( new Error( 'failed to load script from ' + el.src ) )
            } )

            el.setAttribute( 'src', attr[ 'base-url' ] + '/lib/include.js' )

            document.getElementsByTagName( 'head' )[ 0 ].appendChild( el )
        } )
    }

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function initializeSMK( attr ) {
        try {
            include.tag( 'smk-tags' )
        }
        catch ( e ) {
            include.tag( 'smk-tags', { loader: 'tags', url: 'smk-tags.json' } )
        }

        return include( 'smk-tags' )
            .then( function ( inc ) {
                console.log( 'tags', inc[ 'smk-tags' ] )
            } )
            .then( function () {
                if ( window.jQuery ) {
                    include.tag( 'jquery' ).include = Promise.resolve( window.jQuery )
                    return
                }

                return include( 'jquery' )
            } )
            .then( function () {
                if ( window.Vue ) {
                    include.tag( 'vue' ).include = Promise.resolve( window.Vue )
                    return
                }

                return include( 'vue' )
            } )
            .then( function () {
                return include( 'smk-map' ).then( function ( inc ) {
                    var map = SMK.MAP[ attr[ 'container-id' ] ] = new SMK.TYPE.SmkMap( attr )
                    return map.initialize()
                } )
            } )
    }

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function polyfills() {
        window.dojoConfig = {
            has: {
                "esri-promise-compatibility": 1
            }
        }

        // - - - - - - - - - - - - - - - - - - - - -
        // document.currentScript polyfill for IE11
        // - - - - - - - - - - - - - - - - - - - - -
        if ( !document.currentScript ) ( function() {
            var scripts = document.getElementsByTagName( 'script' )
            // document._currentScript = document.currentScript

            // return script object based off of src
            var getScriptFromURL = function( url ) {
                // console.log( url )
                for ( var i = 0; i < scripts.length; i++ )
                    if ( scripts[ i ].src == url ) {
                        // console.log( scripts[ i ] )
                        return scripts[ i ]
                    }
            }

            var actualScript = document.actualScript = function() {
                // if (document._currentScript)
                //     return document._currentScript

                var stack
                try {
                    omgwtf
                } catch( e ) {
                    stack = e.stack
                };

                if ( !stack ) return

                var entries = stack.split( /\s+at\s+/ )
                var last = entries[ entries.length - 1 ]

                var m = last.match( /[(](.+?)(?:[:]\d+)+[)]/ )
                if ( m )
                    return getScriptFromURL( m[ 1 ] )
            }

            if ( document.__defineGetter__ )
                document.__defineGetter__( 'currentScript', actualScript )
        } )()
    }

} )();

