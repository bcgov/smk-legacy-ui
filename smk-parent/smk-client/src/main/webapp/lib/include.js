"use strict";
( function () {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var TAG = {}
    var OPTION = {
        baseUrl: document.location
    }

    function includeTag( tag, attr ) {
        // if ( typeof tag == 'string' ) {
            if ( !attr ) {
                if ( !TAG[ tag ] ) throw new Error( 'tag "' + tag + '" not defined' )

                return TAG[ tag ]
            }

            if ( tag in TAG )
                throw new Error( 'tag "' + tag + '" already defined' )

            TAG[ tag ] = attr
            return attr
        // }
        // else {
        //     Object.assign( TAG, tag )
        // }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function option( option ) {
        if ( typeof option == 'string' ) return OPTION[ option ]
        Object.assign( OPTION, option )
    }

    // var scripts = document.getElementsByTagName( 'script' );
    // var script = scripts[ scripts.length - 1 ];
    // var script = document.currentScript

    // var main = script.attributes[ 'data-main' ]
    // if ( main && !main.nodeValue )
    //     throw new Error( 'no value for data-main attribute on ' + script )

    // var mainUrl = main.nodeValue.trim()
    // if ( !mainUrl )
    //     throw new Error( 'no value for data-main attribute on ' + script )

    // var baseUrl = new URL( mainUrl.replace( '(^|/)[^/]+$', '' ), document.location ).toString()

    // var tags = script.attributes[ 'data-tags' ]
    // if ( tags ) {
    //     tags = tags.nodeValue
    //     if ( tags )
    //         includeTag( '$tags', {
    //             url:    tags,
    //             loader: 'template'
    //         } )
    // }

    // var arg = script.attributes[ 'data-arg' ]
    // if ( arg )
    //     try {
    //         arg = parseJSONC( arg.nodeValue )
    //     }
    //     catch ( e ) {
    //         console.warn( 'data-arg parse failed', e )
    //         arg = null
    //     }

    // includeTag( '$main', {
    //     url:    mainUrl,
    //     loader: 'script',
    //     arg:    arg
    // } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var loader = {}

    loader.$resolveUrl = function ( url ) {
        if ( /^[.][/]/.test( url ) ) return url

        return ( new URL( url, OPTION.baseUrl ) ).toString()
    }

    loader.tags = function ( inc ) {
        return this.template( inc )
            .then( function ( data ) {
                var tagData = parseJSONC( data )
                var tags = Object.keys( tagData )
                tags.forEach( function ( t ) {
                    includeTag( t, tagData[ t ] )
                } )
                return tagData
            } )
    }

    loader.script = function ( inc ) {
        var self = this

        if ( inc.load ) {
            return new Promise( function ( res, rej ) {
                res( inc.load.call( window ) )
            } )
        }
        else if ( inc.url ) {
            return new Promise( function ( res, rej ) {
                var script = document.createElement( 'script' )
    
                if ( inc.integrity ) {
                    script.setAttribute( 'integrity', inc.integrity )
                    script.setAttribute( 'crossorigin', '' )
                }
    
                script.addEventListener( 'load', function( ev ) {
                    res( script )
                } )
    
                script.addEventListener( 'error', function( ev ) {
                    rej( new Error( 'failed to load script from ' + script.src ) )
                } )
    
                script.setAttribute( 'src', self.$resolveUrl( inc.url ) )
    
                document.getElementsByTagName( 'head' )[ 0 ].appendChild( script );
                // console.log( 'added element', inc )
            } )    
        }
        else throw new Error( 'Can\'t load script' )
    }

    loader.style = function ( inc ) {
        var self = this

        return new Promise( function ( res, rej ) {
            var style = document.createElement( 'link' )

            style.setAttribute( 'rel', 'stylesheet' )

            if ( inc.integrity ) {
                style.setAttribute( 'integrity', inc.integrity )
                style.setAttribute( 'crossorigin', '' )
            }

            style.addEventListener( 'load', function( ev ) {
                res( style )
            } )

            style.addEventListener( 'error', function( ev ) {
                rej( new Error( 'failed to load stylesheet from ' + style.src ) )
            } )

            if ( inc.load ) {
                style.textContent = inc.load
                // res( style )                
            }
            else if ( inc.url ) {
                style.setAttribute( 'href', self.$resolveUrl( inc.url ) )
            }
            else {
                rej( new Error( 'Can\'t load style' ) )                
            }

            document.getElementsByTagName( 'head' )[ 0 ].appendChild( style );
        } )
    }

    loader.template = function ( inc ) {
        var self = this

        if ( inc.load ) {
            return new Promise( function ( res, rej ) {
                res( inc.data = inc.load )
            } )
        }
        else if ( inc.url ) {
            return new Promise( function ( res, rej ) {
                var req = new XMLHttpRequest()
                var url = self.$resolveUrl( inc.url )

                req.addEventListener( 'load', function () {
                    res( inc.data = this.responseText )
                } )

                req.addEventListener( 'error', function ( ev ) {
                    console.log(ev)
                    rej( new Error( 'failed to load template from ' + url ) )
                } )

                req.open( 'GET', url )
                req.send()
            } )
        }
        else throw new Error( 'Can\'t load template' )
    }

    loader.sequence = function ( inc ) {
        inc.tags.forEach( function ( t, i, a ) {
            a[ i ] = _assignAnonTag( t )
        } )

        var promise = Promise.resolve()
        var res = {}

        inc.tags.forEach( function ( t ) {
            promise = promise.then( function () {
                return _include( t )
            } )
            .then( function ( r ) {
                res[ t ] = r
            } )
        } )

        return promise.then( function () {
            return res
        } )
    }

    loader.group = function ( inc ) {
        inc.tags.forEach( function ( t, i, a ) {
            a[ i ] = _assignAnonTag( t )
        } )

        var promises = inc.tags.map( function ( tag ) {
            return Promise.resolve().then( function () { return _include( tag ) } )
        } )

        return Promise.all( promises )
            .then( function ( ress ) {
                var res = {}
                inc.tags.forEach( function ( t, i ) {
                    res[ t ] = ress[ i ]
                } )
                return res
            } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function include( tags ) {
        if ( !Array.isArray( tags ) )
            tags = [].slice.call( arguments )

        return loader.group( { tags: tags } )
    }

    var extLoader = {
        js: 'script',
        css: 'style',
        html: 'template'
    }

    function _assignAnonTag( tag ) {
        if ( typeof tag == 'string' ) return tag

        var anon = tag
        var anonTag = 'anon-' + hash( anon )
        try {
            var inc = includeTag( anonTag )
            console.warn( 'tag "' + anonTag + '" already defined as', inc, ', will be used instead of', tag )
        }
        catch ( e ) {
            includeTag( anonTag, anon )
        }

        return anonTag
    }

    function _include( tag ) {
        var inc = includeTag( _assignAnonTag( tag ) )

        if ( inc.include ) return inc.include

        if ( !inc.loader ) {
            var ext = inc.url.match( /[.]([^.]+)$/ )
            if ( ext ) inc.loader = extLoader[ ext[ 1 ] ]
        }

        if ( !loader[ inc.loader ] ) throw new Error( 'tag "' + tag + '" has unknown loader "' + inc.loader + '"' )

        return inc.include = loader[ inc.loader ].call( loader, inc )
            .then( function ( res ) {
                inc.loaded = res

                if ( !inc.module ) return res

                return inc.module
            } )
            .then( function ( res ) {
                console.log( 'included ' + inc.loader + ' "' + tag + '"', inc.url || inc.tags )
                return res
            } )
            .catch( function ( e ) {
                e.message += ', for tag "' + tag + '"'
                console.warn( e )
                throw e
            } )
    }

    function module( tag, incs, mod ) {
        try {
            var inc = includeTag( tag )
        }
        catch ( e ) {
            console.warn( 'tag "' + tag + '" for module not defined, creating' )
            var inc = includeTag( tag, {} )
        }

        if ( inc.module )
            console.warn( 'tag "' + tag + '" for module already defined, overwriting' )

        var deps
        if ( incs )
            deps = include( incs )
        else
            deps = Promise.resolve()

        return inc.module = deps
            .then( function ( res ) {
                if ( typeof mod == 'function' )
                    return mod.call( inc, res )

                return mod
            } )
            .then( function ( exp ) {
                console.log( 'module "' + tag + '"' )
                inc.exported = exp
                return exp
            } )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // var p = Promise.resolve()

    // if ( TAG.$tags )
    //     p = p.then( function () {
    //         return include( '$tags' )
    //     } )
    //     .then( function ( inc ) {
    //         includeTag( parseJSONC( inc[ '$tags' ] ) )
    //     } )

    // p.then( function () {
    //     return include( '$main' )
    // } )
    // .catch( function ( e ) {
    //     console.warn( 'failed to include $main', e )
    // } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /**
     * Modified from http://stackoverflow.com/a/22429679
     *
     * Calculate a 32 bit FNV-1a hash
     * Found here: https://gist.github.com/vaiorabbit/5657561
     * Ref.: http://isthe.com/chongo/tech/comp/fnv/
     *
     * @param {any} val the input value
     * @returns {string}
     */
    var typeCode = {
        undefined:  '\x00',
        null:       '\x01',
        boolean:    '\x02',
        number:     '\x03',
        string:     '\x04',
        function:   '\x05',
        array:      '\x06',
        object:     '\x0a'
    };

    function type( val ) {
        var t = typeof val
        if ( t != 'object' ) return t
        if ( Array.isArray( val ) ) return 'array'
        if ( val === null ) return 'null'
        return 'object'
    }

    function hash( val ) {
        var h = 0x811c9dc5;

        walk( val );

        return ( "0000000" + ( h >>> 0 ).toString( 16 ) ).substr( -8 );

        function walk( val ) {
            var t = type( val );

            switch ( t ) {
            case 'string':
                return addBits( val );

            case 'array':
                addBits( typeCode[ t ] );

                for ( var j in val )
                    walk( val[ j ] )

                return;

            case 'object':
                addBits( typeCode[ t ] );

                var keys = Object.keys( val ).sort();
                for ( var j in keys ) {
                    var key = keys[ j ];
                    addBits( key );
                    walk( val[ key ] );
                }
                return;

            case 'undefined':
            case 'null':
                return addBits( typeCode[ t ] )

            default:
                return addBits( typeCode[ t ] + String( val ) )
            }
        }

        function addBits( str ) {
            for ( var i = 0, l = str.length; i < l; i++ ) {
                h ^= str.charCodeAt(i);
                h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
            }
        }
    }

    function parseJSONC( jsonWithComments ) {
        return JSON.parse( stripJsonComments( jsonWithComments ) )
    }

    // assumes is valid json data with single line comments added
    function stripJsonComments( json ) {
        var strippedLines = json.replace( /^\s*[/][/].*$/gm, '' ).split( '\n' );

        for ( var i in strippedLines ) {
            var pieces = strippedLines[ i ].split( /[/][/]/g )

            // no trailing comments
            if ( pieces.length < 2 ) continue;

            // 2 pieces and no quotes in 2nd piece
            if ( pieces.length == 2 && ( !pieces[ 1 ] || !/"/.test( pieces[ 1 ] ) ) ) {
                strippedLines[ i ] = pieces[ 0 ]
                continue;
            }

            // more than 2 pieces, and no quotes in first piece
            if ( pieces.length > 2 && ( !/"/.test( pieces[ 0 ] ) ) ) {
                strippedLines[ i ] = pieces[ 0 ]
                continue;
            }

            // console.log( pieces )

            // gather pieces until the quotes balance
            var j = 1, out = pieces[ 0 ];
            while ( j < pieces.length ) {
                // find all quotes, with their prefixes
                var quotes = out.match( /[^"]*"/g )

                // count quotes than haven't been escaped
                var unescaped = 0;
                for ( var k = 0; k < quotes.length; k++ ) {
                    if ( /([^\\]|^)([\\][\\])*.$/.test( quotes[ k ] ) ) {
                        // console.log( quotes[ k ] )
                        unescaped += 1;
                    }
                }
                // console.log( '==+', out, quotes, unescaped )

                // a even number of unescaped quotes means that we've got a balanced piece
                if ( ( unescaped & 1 ) == 0 ) break;

                // accumulate next piece
                out += '//' + pieces[ j ]
                j += 1;
            }
            // console.log( '==', out )

            strippedLines[ i ] = out;
        }
        return strippedLines.join( '\n' )
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    window.include = include
    window.include.module = module
    window.include.tag = includeTag
    window.include.hash = hash
    window.include.option = option

} )()

