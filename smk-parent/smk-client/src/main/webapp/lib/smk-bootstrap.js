( function () {

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

    // var scripts = document.getElementsByTagName( 'script' );
    // var script = scripts[ scripts.length - 1 ];
    var script = document.currentScript

    try {
        var scriptConfig = JSON.parse( script.innerText.trim().replace( /^\s*\/\/.*$/mg, '' ).replace( /^\s*return\s*/mg, '' ) )
        script.innerText = ''
    }
    catch ( e ) {
        console.warn( 'parsing config:', e )
    }

    var attr = function ( key, defalt ) {
        if ( !script.attributes[ key ] ) return defalt

        if ( defalt === false && !script.attributes[ key ].nodeValue )
            var val = true
        else
            var val = script.attributes[ key ].nodeValue

        script.attributes.removeNamedItem( key )

        return val
    }

    var arg = {
        containerId:    attr( 'smk-container', 'smk-map-frame' ),
        configUrls:     attr( 'smk-config', '' ).split( /\s*,\s*/ ).filter( function ( url ) { return !!url } ),
        standalone:     attr( 'smk-standalone', false ),
        config:         scriptConfig,
    }

    if ( arg.config.error ) {
        document.getElementById( arg.containerId ).innerHTML = '<h1 class="error">Startup error: ' + arg.config.error + '</h1>';
        return
    }

    if ( window.include ) {
        initializeSMK( arg )
    }
    else {
        var el = document.createElement( 'script' )

        el.addEventListener( 'load', function( ev ) {
            initializeSMK( arg )
        } )
        el.addEventListener( 'error', function( ev ) {
            throw new Error( 'failed to load script from ' + el.src )
        } )
        el.setAttribute( 'src',        '../smk-client/lib/include.js' )
    // el.setAttribute( 'data-main',  '/service/lib/main.js' )
    // el.setAttribute( 'data-arg',   JSON.stringify( arg ) )
    // el.setAttribute( 'data-tags',  'tags.json' )

        document.getElementsByTagName( 'head' )[ 0 ].appendChild( el )
    }

    function initializeSMK( smkArg ) {
        include.option( { baseUrl: new URL( '../smk-client/lib/', document.location ).toString() } )

        include( { loader: 'tags', url: 'tags.json' } )
            .then( function () {
                include( 'jquery', 'smk' ).then( function ( inc ) {
                    // inc.smk.MODULE.jQuery = $;
                    include.tag( 'jquery' ).exported = $
                } )

                include( 'vue', 'smk' ).then( function ( inc ) {
                    // inc.smk.MODULE.Vue = Vue;
                    include.tag( 'vue' ).exported = Vue

                    // may not be a good idea
                    Vue.mixin( {
                        methods: {
                            $$emit: function ( event, arg ) {
                                this.$root.$emit( this.$options._componentTag + '.' + event, arg )
                            }
                        }
                    } )
                } )

                include( 'smk', 'smk-map' ).then( function ( inc ) {

                    return ( inc.smk.MAP[ smkArg.containerId ] = new inc.smk.TYPE.SmkMap( {
                        containerId:    smkArg.containerId,
                        config:         smkArg.config,
                        configUrls:     smkArg.configUrls,
                        standalone:     smkArg.standalone
                    } ) ).initialize()

                } )
            } )
    }

} )();

