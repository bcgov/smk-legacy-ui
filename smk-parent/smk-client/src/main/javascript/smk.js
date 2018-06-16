( function () {

    var util = {}
    installPolyfills( util )
    setupGlobalSMK( util )

    var bootstrapScriptEl = document.currentScript

    var timer
    SMK.BOOT = SMK.BOOT
        .then( parseScriptElement )
        .then( function ( attr ) {
            timer = 'SMK initialize ' + attr.id
            console.time( timer )
            return attr
        } )
        .then( resolveConfig )
        .then( initializeSmkMap )
        .catch( SMK.ON_FAILURE )

    util.promiseFinally( SMK.BOOT, function () {
        console.timeEnd( timer )
    } )

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function parseScriptElement() {
        var smkAttr = {
            'id':           attrString( '1' ),
            'container-sel':attrString( '#smk-map-frame' ),
            'title-sel':    attrString( 'head title' ),
            'config':       attrList( '?smk-' ),
            'disconnected': attrBoolean( false, true ),
            'base-url':     attrString( ( new URL( bootstrapScriptEl.src.replace( 'smk.js', '' ), document.location ) ).toString() ),
            'service-url':  attrString( '../smks-api' ),
        }

        Object.keys( smkAttr ).forEach( function ( k ) {
            smkAttr[ k ] = smkAttr[ k ]( 'smk-' + k, bootstrapScriptEl )
        } )

        console.log( 'SMK attributes', JSON.parse( JSON.stringify( smkAttr ) ) )

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
        var configs = []
        attr.config.forEach( function ( c, i ) {
            var source = 'attr[' + i + ']'
            configs = configs.concat( parseDocumentArguments( c, source ) || parseLiteralJson( c, source ) || parseOption( c, source ) || parseUrl( c, source ) )
        } )

        attr.config = configs

        return attr
    }

    function parseDocumentArguments( config, source ) {
        if ( !/^[?]/.test( config ) ) return

        var paramPattern = new RegExp( '^' + config.substr( 1 ) + '(.+)$', 'i' )

        var params = location.search.substr( 1 ).split( '&' )
        var configs = []
        params.forEach( function ( p, i ) {
            var source1 = source + ' -> arg[' + config + ',' + i + ']'
            try {
                var m = decodeURIComponent( p ).match( paramPattern )
                if ( !m ) return

                configs = configs.concat( parseOption( m[ 1 ], source1 ) || [] )
            }
            catch ( e ) {
                if ( !e.parseSource ) e.parseSource = source1
                throw e
            }
        } )

        return configs
    }

    function parseLiteralJson( config, source ) {
        if ( !/^[{].+[}]$/.test( config ) ) return

        source += ' -> json'
        try {
            var obj = JSON.parse( config )
            obj.$sources = [ source ]

            return obj
        }
        catch ( e ) {
            if ( !e.parseSource ) e.parseSource = source
            throw e
        }
    }

    function parseOption( config, source ) {
        var m = config.match( /^(.+?)([=](.+))?$/ )
        if ( !m ) return

        var option = m[ 1 ].toLowerCase()
        if ( !( option in optionHandler ) ) return

        source += ' -> option[' + option + ']'
        try {
            var obj = optionHandler[ option ]( m[ 3 ], source )
            if ( !obj.$sources )
                obj.$sources = [ source ]

            return obj
        }
        catch ( e ) {
            if ( !e.parseSource ) e.parseSource = source
            throw e
        }
    }

    function parseUrl( config, source ) {
        source += ' -> url[' + config + ']'
        var obj = {
            url: config,
            $sources: [ source ]
        }

        return obj
    }

    var optionHandler = {
        'config': function ( arg, source ) {
            return parseLiteralJson( arg, source ) || parseUrl( arg, source )
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
        },

        'query': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 3 ) throw new Error( '-query needs at least 3 arguments' )

            var queryId = 'query-' + arg.replace( /[^a-z0-9]+/ig, '-' ).replace( /(^[-]+)|([-]+$)/g, '' ).toLowerCase()

            var layerId = args[ 0 ]
            var conj = args[ 1 ].trim().toLowerCase()
            if ( conj != 'and' && conj != 'or' ) throw new Error( '-query conjunction must be one of: AND, OR' )

            var parameters = []
            function constant( value ) {
                var id = 'constant' + ( parameters.length + 1 )
                parameters.push( {
                    id: id,
                    type: 'constant',
                    value: JSON.parse( value )
                } )
                return id
            }

            var clauses = args.slice( 2 ).map( function ( p ) {
                var m = p.trim().match( /^(\w+)\s*(like|LIKE|=|<=?|>=?)\s*(.+?)$/ )
                if ( !m ) throw new Error( '-query expression is invalid' )

                var args = [
                    { operand: 'attribute', name: m[ 1 ] },
                    { operand: 'parameter', id: constant( m[ 3 ] ) }
                ]

                switch ( m[ 2 ].toLowerCase() ) {
                    case 'like': return { operator: 'contains', arguments: args }
                    case '=': return { operator: 'equals', arguments: args }
                    case '>': return { operator: 'greater-than', arguments: args }
                    case '<': return { operator: 'less-than', arguments: args }
                    case '>=': return { operator: 'not', arguments: [ { operator: 'less-than', arguments: args } ] }
                    case '<=': return { operator: 'not', arguments: [ { operator: 'greater-than', arguments: args } ] }
                }
            } )

            return {
                viewer: {
                    activeTool: 'query--' + layerId + '--' + queryId,
                },
                tools: [ {
                    type: 'query',
                    instance: layerId + '--' + queryId,
                    onActivate: 'execute'
                } ],
                layers: [ {
                    id: layerId,
                    queries: [ {
                        id: queryId,
                        parameters: parameters,
                        predicate: {
                            operator: conj,
                            arguments: clauses
                        }
                    } ]
                } ]
            }
        },

        'layer': function ( arg, source ) {
            var args = arg.split( ',' )
            if ( args.length < 2 ) throw new Error( '-layer needs at least 2 arguments' )

            var layerId = 'layer-' + arg.replace( /[^a-z0-9]+/ig, '-' ).replace( /(^[-]+)|([-]+$)/g, '' ).toLowerCase()

            var type = args[ 0 ].trim().toLowerCase()
            switch ( type ) {
                case 'esri-dynamic':
                    if ( args.length < 3 ) throw new Error( '-layer=esri-dynamic needs at least 3 arguments' )
                    return {
                        layers: [ {
                            id:         layerId,
                            type:       'esri-dynamic',
                            isVisible:  true,
                            serviceUrl: args[ 1 ],
                            mpcmId:     args[ 2 ],
                            title:      args[ 3 ] || ( 'ESRI Dynamic ' + args[ 2 ] ),
                        } ]
                }

                case 'wms':
                    if ( args.length < 3 ) throw new Error( '-layer=wms needs at least 3 arguments' )
                    return {
                        layers: [ {
                            id:         layerId,
                            type:       'wms',
                            isVisible:  true,
                            serviceUrl: args[ 1 ],
                            layerName:  args[ 2 ],
                            styleName:  args[ 3 ],
                            title:      args[ 4 ] || ( 'WMS ' + args[ 2 ] ),
                        } ]
                }

                case 'vector':
                    return {
                        layers: [ {
                            id:         layerId,
                            type:       'vector',
                            isVisible:  true,
                            dataUrl:    args[ 1 ],
                            title:      args[ 2 ] || ( 'Vector ' + args[ 1 ] ),
                        } ]
                    }

                default: throw new Error( 'unknown layer type: ' + type )
            }
        },

        'show-tool': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-show-tool needs at least 1 argument' )

            return {
                tools: args.map( function ( type ) {
                    if ( type == 'all' ) type = '*'
                    return {
                        type: type,
                        enabled: true
                    }
                } )
            }
        },

        'hide-tool': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-hide-tool needs at least 1 argument' )

            return {
                tools: args.map( function ( type ) {
                    if ( type == 'all' ) type = '*'
                    return {
                        type: type,
                        enabled: false
                    }
                } )
            }
        },

        'show-layer': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-show-layer needs at least 1 argument' )

            return {
                layers: args.map( function ( id ) {
                    if ( id == 'all' ) id = '**'
                    return {
                        id: id,
                        isVisible: true
                    }
                } )
            }
        },

        'hide-layer': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length < 1 ) throw new Error( '-hide-layer needs at least 1 argument' )

            return {
                layers: args.map( function ( id ) {
                    if ( id.toLowerCase() == 'all' ) id = '**'
                    return {
                        id: id,
                        isVisible: false
                    }
                } )
            }
        },

        // Options below are for backward compatibility with DMF

        'll': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 2 ) throw new Error( '-ll needs 2 arguments' )

            return {
                viewer: {
                    location: {
                        center: [ args[ 0 ], args[ 1 ] ]
                    }
                }
            }
        },

        'z': function ( arg ) {
            var args = arg.split( ',' )
            if ( args.length != 1 ) throw new Error( '-z needs 1 argument' )

            return {
                viewer: {
                    location: {
                        zoom: args[ 0 ]
                    }
                }
            }
        },

    }

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function initializeSmkMap( attr ) {
        include.option( { baseUrl: attr[ 'base-url' ] } )

        return new Promise( function ( res, rej ) {
            if ( document.readyState != "loading" ) 
                return res()
            
            document.addEventListener( "DOMContentLoaded", function( ev ) {
                clearTimeout( id )
                res()
            } )

            var id = setTimeout( function () {
                console.error( 'timeout waiting for document ready' )
                rej()
            }, 20000 )
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
                return include( 'vue-config' )
            } )
            .then( function () {
                if ( window.turf ) {
                    include.tag( 'turf' ).include = Promise.resolve( window.turf )
                    return
                }

                return include( 'turf' )
            } )
            .then( function () {
                return include( 'smk-map' ).then( function ( inc ) {
                    if ( attr[ 'id' ] in SMK.MAP )
                        throw new Error( 'An SMK map with smk-id "' + attr[ 'id' ] + '" already exists' )

                    var map = SMK.MAP[ attr[ 'id' ] ] = new SMK.TYPE.SmkMap( attr )
                    return map.initialize()
                } )
            } )
    }

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function installPolyfills( util ) {
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


        if ( Promise.prototype.finally )
            util.promiseFinally = function ( promise, onFinally ) {
                return promise.finally( onFinally )
            }
        else
            util.promiseFinally = function ( promise, onFinally ) {
                var onThen = function ( arg ) {
                    onFinally()
                    return arg
                }

                var onFail = function ( arg ) {
                    onFinally()
                    return Promise.reject( arg )
                }

                return promise.then( onThen, onFail )
            }

    }

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

    function setupGlobalSMK( util ) {
        return window.SMK = Object.assign( {
            MAP: {},
            VIEWER: {},
            TYPE: {},
            UTIL: util,

            CONFIG: {
                name: 'SMK Default map',
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
                        type: "location",
                        enabled: true,
                    },
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
            },

            BOOT: Promise.resolve(),
            TAGS_DEFINED: false,
            ON_FAILURE: function ( e ) {
                if ( !e ) return 

                if ( e.parseSource )
                    e.message += ',\n  while parsing ' + e.parseSource

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
                        <pre style="white-space: normal">{}</pre>\
                    </div>\
                '.replace( /\s+/g, ' ' ).replace( '{}', e || '' )

                document.querySelector( 'body' ).appendChild( message )
            },

            BUILD: {
                commit:     '<%= gitinfo.local.branch.current.SHA %>',
                branch:     '<%= gitinfo.local.branch.current.name %>',
                lastCommit: '<%= gitinfo.local.branch.current.lastCommitTime %>'.replace( /^"|"$/g, '' ),
                origin:     '<%= gitinfo.remote.origin.url %>',
                pomVersion: '<%= pom.project.parent.version %>',
            }

        }, window.SMK )
    }

} )();

