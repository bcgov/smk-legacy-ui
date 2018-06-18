include.module( 'query.query-esri-dynamic-js', [ 'query.query-js' ], function () {
    "use strict";

    function EsriDynamicQuery() {
        SMK.TYPE.Query.prototype.constructor.apply( this, arguments )
    }

    $.extend( EsriDynamicQuery.prototype, SMK.TYPE.Query.prototype )

    SMK.TYPE.Query[ 'esri-dynamic' ] = EsriDynamicQuery
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    EsriDynamicQuery.prototype.fetchUniqueValues = function ( attribute, viewer ) {
        var self = this

        var layerConfig = viewer.layerId[ this.layerId ].config
        var dynamicLayer= JSON.parse( layerConfig.dynamicLayers[ 0 ] )
        var serviceUrl  = layerConfig.serviceUrl + '/dynamicLayer/query'

        delete dynamicLayer.drawingInfo

        return SMK.UTIL.asyncReduce( function ( accum, done ) {
            return fetchSomeUniqueValues( accum, serviceUrl, dynamicLayer, attribute )
                .then( function ( values ) {
                    if ( !values || values.length == 0 ) return done( accum )
                    var a = accum.concat( values )
                    if ( a.length >= self.maxUniqueValues ) done()
                    return a
                } )
        }, [] )
    }

    function fetchSomeUniqueValues( excludes, serviceUrl, dynamicLayer, attribute ) {
        var notNullExcludes = excludes.filter( function ( v ) { return v != null } )
        var filter = '(1=1)'

        if ( excludes.length != notNullExcludes.length )
            filter = '( ' + attribute + ' IS NOT NULL )'

        if ( notNullExcludes.length > 0 )
            filter += ' AND ' + attribute + ' NOT IN ( ' + notNullExcludes.map( function ( x ) { return "'" + x + "'" } ).join( ', ') + ' )'

        var data = {
            f:                  'geojson',
            layer:              JSON.stringify( dynamicLayer ).replace( /^"|"$/g, '' ),
            where:              filter,
            outFields:          attribute,
            inSR:               4326,
            outSR:              4326,
            returnGeometry:     false,
            returnZ:            false,
            returnM:            false,
            returnIdsOnly:      false,
            returnCountOnly:    false,
            returnDistinctValues:true,
            // resultRecordCount:  10,
        }

        return SMK.UTIL.makePromise( function ( res, rej ) {
            $.ajax( {
                url:        serviceUrl,
                method:     'POST',
                data:       data,
                dataType:   'json',
                // contentType:    'application/json',
                // crossDomain:    true,
                // withCredentials: true,
            } ).then( res, rej )
        } )
        .then( function ( data ) {
            console.log( data )

            if ( !data ) return
            if ( !data.features || data.features.length == 0 ) return

            var value = {}
            var hasNull = false
            data.features.forEach( function ( f, i ) {
                if ( f.properties[ attribute ] == null )
                    hasNull = true
                else
                    value[ f.properties[ attribute ] ] = true
            } )

            return Object.keys( value ).concat( hasNull ? [ null ] : [] )
        } )

    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    EsriDynamicQuery.prototype.queryLayer = function ( param, config, viewer ) {
        var self = this

        var layerConfig = viewer.layerId[ this.layerId ].config

        if ( layerConfig.dynamicLayers.length != 1 )
            throw new Error( 'more than one dynamic layer def' )

        var serviceUrl  = layerConfig.serviceUrl + '/dynamicLayer/query'

        var dynamicLayer = JSON.parse( layerConfig.dynamicLayers[ 0 ] )
        delete dynamicLayer.drawingInfo

        var whereClause = makeWhereClause( this.predicate, param )

        var attrs = layerConfig.attributes.filter( function ( a ) { return a.visible !== false } ).map( function ( a ) { return a.name } )

        var data = {
            f:                  'geojson',
            layer:              JSON.stringify( dynamicLayer ).replace( /^"|"$/g, '' ),
            where:              whereClause,
            outFields:          attrs.join( ',' ),
            inSR:               4326,
            outSR:              4326,
            returnGeometry:     true,
            returnZ:            false,
            returnM:            false,
            returnIdsOnly:      false,
            returnCountOnly:    false,
            returnDistinctValues:   false,
        }

        if ( config.within ) {
            data.geometry = viewer.getView().extent.join( ',' )
            data.geometryType = 'esriGeometryEnvelope'
            data.spatialRel = 'esriSpatialRelIntersects'
        }

        return SMK.UTIL.makePromise( function ( res, rej ) {
            $.ajax( {
                url:        serviceUrl,
                method:     'POST',
                data:       data,
                dataType:   'json',
                // contentType:    'application/json',
                // crossDomain:    true,
                // withCredentials: true,
            } ).then( res, rej )
        } )
        .then( function ( data ) {
            console.log( data )

            if ( !data ) throw new Error( 'no features' )
            if ( !data.features || data.features.length == 0 ) throw new Error( 'no features' )

            return data.features.map( function ( f, i ) {
                if ( layerConfig.titleAttribute )
                    f.title = f.properties[ layerConfig.titleAttribute ]
                else
                    f.title = 'Feature #' + ( i + 1 )

                return f
            } )
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function makeWhereClause( predicate, param ) {
        return handleWhereOperator( predicate, param )
    }

    function handleWhereOperator( predicate, param ) {
        if ( !( predicate.operator in whereOperator ) )
            throw new Error( 'unknown operator: ' + JSON.stringify( predicate ) )

        return whereOperator[ predicate.operator ]( predicate.arguments, param )
    }

    var whereOperator = {
        'and': function ( args, param ) {
            if ( args.length == 0 ) throw new Error( 'AND needs at least 1 argument' )

            return args.map( function ( a ) { return '( ' + handleWhereOperator( a, param ) + ' )' } ).join( ' AND ' )
        },

        'or': function ( args, param ) {
            if ( args.length == 0 ) throw new Error( 'OR needs at least 1 argument' )

            return args.map( function ( a ) { return '( ' + handleWhereOperator( a, param ) + ' )' } ).join( ' OR ' )
        },

        'equals': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'EQUALS needs exactly 2 arguments' )

            return handleWhereOperand( args[ 0 ], param ) + ' = ' + handleWhereOperand( args[ 1 ], param )
        },

        'less-than': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'LESS-THAN needs exactly 2 arguments' )

            return handleWhereOperand( args[ 0 ], param ) + ' < ' + handleWhereOperand( args[ 1 ], param )
        },

        'greater-than': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'GREATER-THAN needs exactly 2 arguments' )

            return handleWhereOperand( args[ 0 ], param ) + ' > ' + handleWhereOperand( args[ 1 ], param )
        },

        'contains': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'CONTAINS needs exactly 2 arguments' )

            return handleWhereOperand( args[ 0 ], param ) + ' LIKE \'%' + handleWhereOperand( args[ 1 ], param, false ) + '%\''
        },

        'starts-with': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'STARTS-WITH needs exactly 2 arguments' )

            return handleWhereOperand( args[ 0 ], param ) + ' LIKE \'' + handleWhereOperand( args[ 1 ], param, false ) + '%\''
        },

        'ends-with': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'ENDS-WITH needs exactly 2 arguments' )

            return handleWhereOperand( args[ 0 ], param ) + ' LIKE \'%' + handleWhereOperand( args[ 1 ], param, false ) + '\''
        },

        'not': function ( args, param ) {
            if ( args.length != 1 ) throw new Error( 'NOT needs exactly 1 argument' )

            return 'NOT ' + handleWhereOperator( args[ 0 ], param )
        }
    }

    function handleWhereOperand( predicate, param, quote ) {
        if ( !( predicate.operand in whereOperand ) )
            throw new Error( 'unknown operand: ' + JSON.stringify( predicate ) )

        return whereOperand[ predicate.operand ]( predicate, param, quote )
    }

    var whereOperand = {
        'attribute': function ( arg, param, quote ) {
            if ( quote === false  )
                return '\' || ' + arg.name + ' || \''

            return arg.name
        },

        'parameter': function ( arg, param, quote ) {
            return ( quote === false ? '' : '\'' ) + escapeWhereParameter( param[ arg.id ].value ) + ( quote === false ? '' : '\'' )
        }
    }

    function escapeWhereParameter( p ) { return p }

} )
