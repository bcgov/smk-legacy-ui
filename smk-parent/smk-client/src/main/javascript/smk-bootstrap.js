( function () {

    polyfills()

    if ( !window.SMK ) window.SMK = {}
    if ( !window.SMK.BOOT ) window.SMK.BOOT = Promise.resolve()

    window.SMK.BOOT = window.SMK.BOOT
        .then( parseScriptElement )
        .then( resolveConfig )
        .then( loadInclude )
        .then( initializeSMK )

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
            var paramPattern = new RegExp( '^' + config.substr( 1 ) + '([-].+)$' )

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
                    return ( inc.smk.MAP[ attr[ 'container-id' ] ] = new inc.smk.TYPE.SmkMap( attr ) ).initialize()
                } )
            } )
            .catch( function ( e ) {
                console.error( 'smk viewer #' + attr[ 'container-id' ] + ' failed to initialize:', e )

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
                '.replace( '{}', e.stack )

                document.querySelector( 'body' ).appendChild( message )
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

