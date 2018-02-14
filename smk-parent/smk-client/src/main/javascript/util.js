include.module( 'util', [ 'jquery' ], function ( inc ) {

    $.extend( window.SMK.UTIL, {
        makePromise: function( withFn ) {
            return new Promise( withFn || function () {} )
            // return $.Deferred( withFn )
        },

        resolved: function() {
            return Promise.resolve.apply( Promise, arguments )
            // var p = this.makePromise()
            // return p.resolve.apply( p, arguments ).promise()
        },

        rejected: function() {
            return Promise.reject.apply( Promise, arguments )
            // var p = this.makePromise()
            // return p.reject.apply( p, arguments ).promise()
        },

        waitAll: function ( promises ) {
            return Promise.all( promises )
            // return $.when.apply( $, promises )
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

        /**
         * Very similar to $.extends, except in how it handles arrays, and object values that are collections.
         * Merges object `b` into object `a` (modifies `a`), and returns `a`.
         * If corresponding elements in `a` and `b` are arrays, the array in `b` is APPENDED to the one in `a`.
         * `a` and `b` must be same type of collection to be merged. This applies recursively to keys of objects.
         * @param  {object|array} a Object that receives changes
         * @param  {object|array} b Changes to apply to `a`
         * @return {object|array} `a`
         */
        mergeConfig: function( a, b, key ) {
            var aType = $.type( a ),
                bType = $.type( b );

            key = key || ''

            if ( aType != 'array' && aType != 'object' )
                throw new Error( 'a' + key + ' must be a collection type' )

            if ( b == null )
                return a

            if ( aType == 'array' && bType == 'array' )
                return $.merge( a, b )

            if ( aType != 'object' || bType != 'object'  )
                throw new Error( 'a' + key + ' and b' + key + ' must be same collection type' )

            $.each( b, function ( bk, bv ) {
                var aType = $.type( a[ bk ] )

                switch ( $.type( bv ) ) {
                case 'array':
                case 'object':
                    if ( aType == 'undefined' || aType == 'null' )
                        a[ bk ] = bv
                    else
                        SMK.UTIL.mergeConfig( a[ bk ], bv, key + '[' + bk + ']' )
                    break;

                default:
                    if ( aType == 'array' || aType == 'object' )
                        SMK.UTIL.mergeConfig( a[ bk ], bv, key + '[' + bk + ']' )
                    else
                        a[ bk ] = bv
                }
            } )

            return a
        },

        isDeepEqual: function( a, b ) {
            var at = $.type( a );
            var bt = $.type( b );

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
        }

    } )

} )