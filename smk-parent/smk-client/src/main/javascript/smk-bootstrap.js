( function () {

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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    parseScriptElement()
        .then( resolveConfig )
        .then( loadInclude )
        .then( initializeSMK )

    // try {
    //     var inner = script.innerText.trim().replace( /^\s*\/\/.*$/mg, '' ).replace( /^\s*return\s*/mg, '' )
    //     script.innerText = ''
    //     if ( inner )
    //         try {
    //             var scriptConfig = JSON.parse( inner )
    //         }
    //         catch ( e ) {
    //             console.warn( e )
    //             scriptConfig = inner
    //         }

    // }
    // catch ( e ) {
    //     console.warn( 'parsing config:', e )
    // }

    // var attr = function ( key, defalt ) {
    //     if ( !script.attributes[ key ] ) return defalt

    //     if ( defalt === false && !script.attributes[ key ].nodeValue )
    //         var val = true
    //     else
    //         var val = script.attributes[ key ].nodeValue

    //     // script.attributes.removeNamedItem( key )

    //     return val
    // }

    function parseScriptElement() {
        var script = document.currentScript

        var smkAttr = {
            container:    attrString( 'smk-map-frame' ),
            config:       attrList( '?smk' ),
            standalone:   attrBoolean( false, true ),
            disconnected: attrBoolean( false, true ),
            'base-url':   attrString( ( new URL( script.src.replace( 'smk-bootstrap.js', '' ), document.location ) ).toString() ),
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
                var val = attrString( Default, null )( key, el )
                if ( val == null ) return []
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

    function resolveConfig( attr ) {
        //     var params = {}
        // location.search.substr( 1 ).split( '&' ).forEach( function ( p ) {
        //     var m = p.match( /(.+?)=(.*)/ )
        //     if ( !m ) return

        //     params[ m[ 1 ] ] = ( params[ m[ 1 ] ] || [] ).push( m[ 2 ] )
        // } )

        var configs = []
        attr.config.forEach( function ( c ) {
            configs = configs.concat( parseConfig( c ) )
        } )

        attr.config = configs
    }

    function parseConfig( config ) {
        for ( var i in configParsers )
            if ( configParsers[ i ][ 0 ].test( config ) )
                return configParsers[ i ][ 1 ]( config )
    }

    var configParsers = [
        [ /^[?]/, function ( config ) {
            var paramPattern = new RegExp( '^' + config.substr( 1 ) + '([-].+)$' )

            var params = location.search.substr( 1 ).split( '&' )
            var configs = []
            params.forEach( function ( p ) {
                var m = paramPattern.match( p )
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
            if ( !( m[ 1 ] in configHandler ) ) return []

            return configHandler[ m[ 1 ] ]( m[ 3 ] )
        } ],

        [ /.+/, function ( config ) {
            return config
        } ]
    ]

    var configHandler = {
        'config': function ( arg ) {
            if ( /^[?-]/.test( arg ) )
                throw new Error( 'config handler argument cannot start with [?-]' )
            
            return parseConfig( arg )
        }
    }

    // var arg = {
    //     containerId:    attr( 'smk-container', 'smk-map-frame' ),
    //     configUrls:     attr( 'smk-config', '' ).split( /\s*,\s*/ ).filter( function ( url ) { return !!url } ),
    //     standalone:     eval( attr( 'smk-standalone', false ) ),
    //     disconnected:   eval( attr( 'smk-disconnected', false ) ),
    //     config:         scriptConfig,
    // }

    // if ( arg.config && arg.config.error ) {
    //     document.getElementById( arg.containerId ).innerHTML = '<h1 class="error">Startup error: ' + arg.config.error + '</h1>';
    //     return
    // }


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
                return include( 'jquery', 'smk' ).then( function ( inc ) {
                    // inc.smk.MODULE.jQuery = $;
                    include.tag( 'jquery' ).exported = $
                } )
            } )
            .then( function () {
                return include( 'vue', 'smk' ).then( function ( inc ) {
                    // inc.smk.MODULE.Vue = Vue;
                    include.tag( 'vue' ).exported = Vue
                } )
            } )
            .then( function () {
                return include( 'smk', 'smk-map' ).then( function ( inc ) {
                    return ( inc.smk.MAP[ attr.containerId ] = new inc.smk.TYPE.SmkMap( attr ) ).initialize()
                } )
            } )
            .catch( function ( e ) {
                console.warn( e )
            } )
    }


    // if ( window.include )
    //     return initializeSMK( parseScriptElement() )

    //     var includeBase = ( new URL( script.src.replace( 'smk-bootstrap.js', '' ), document.location ) ).toString()

    //     var el = document.createElement( 'script' )
    //     el.addEventListener( 'load', function( ev ) {
    //         include.option( { baseUrl: new URL( includeBase, document.location ).toString() } )
    //         initializeSMK( arg )
    //     } )
    //     el.addEventListener( 'error', function( ev ) {
    //         throw new Error( 'failed to load script from ' + el.src )
    //     } )
    //     el.setAttribute( 'src', includeBase + '/lib/include.js' )

    //     document.getElementsByTagName( 'head' )[ 0 ].appendChild( el )

    // }


} )();

