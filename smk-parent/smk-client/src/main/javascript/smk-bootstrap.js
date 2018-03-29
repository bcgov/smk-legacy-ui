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

    // var scripts = document.getElementsByTagName( 'script' );
    // var script = scripts[ scripts.length - 1 ];
    var script = document.currentScript

    try {
        var inner = script.innerText.trim().replace( /^\s*\/\/.*$/mg, '' ).replace( /^\s*return\s*/mg, '' )
        script.innerText = ''
        if ( inner )
            try {
                var scriptConfig = JSON.parse( inner )
            }
            catch ( e ) {
                console.warn( e )
                scriptConfig = inner
            }

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
        standalone:     eval( attr( 'smk-standalone', false ) ),
        disconnected:   eval( attr( 'smk-disconnected', false ) ),
        config:         scriptConfig,
    }

    if ( arg.config && arg.config.error ) {
        document.getElementById( arg.containerId ).innerHTML = '<h1 class="error">Startup error: ' + arg.config.error + '</h1>';
        return
    }

    if ( window.include ) {
        initializeSMK( arg )
    }
    else {
        var includeBase = ( new URL( script.src.replace( 'smk-bootstrap.js', '' ), document.location ) ).toString()

        var el = document.createElement( 'script' )
        el.addEventListener( 'load', function( ev ) {
            include.option( { baseUrl: new URL( includeBase, document.location ).toString() } )
            initializeSMK( arg )
        } )
        el.addEventListener( 'error', function( ev ) {
            throw new Error( 'failed to load script from ' + el.src )
        } )
        el.setAttribute( 'src', includeBase + '/lib/include.js' )

        document.getElementsByTagName( 'head' )[ 0 ].appendChild( el )

    }

    function initializeSMK( smkArg ) {

        try {
            include.tag( 'smk-tags' )
        }
        catch ( e ) {
            include.tag( 'smk-tags', { loader: 'tags', url: 'smk-tags.json' } )
        }

        include( 'smk-tags' ).then( function ( inc ) {
            console.log( 'tags', inc[ 'smk-tags' ] )

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
                                if ( this.$options._componentTag )
                                    event = this.$options._componentTag + '.' + event

                                this.$root.$emit( event, arg, this )
                            }
                        }
                    } )
                } )

                include( 'smk', 'smk-map' ).then( function ( inc ) {
                    return ( inc.smk.MAP[ smkArg.containerId ] = new inc.smk.TYPE.SmkMap( smkArg ) ).initialize()
                } )
            } )
    }

} )();

