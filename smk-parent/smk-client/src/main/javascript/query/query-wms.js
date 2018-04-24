include( 'query' ).then( function () {

    function WmsQuery() {
        SMK.TYPE.Query.prototype.constructor.apply( this, arguments )
    }

    $.extend( WmsQuery.prototype, SMK.TYPE.Query.prototype )

    SMK.TYPE.Query[ 'wms' ] = WmsQuery
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    WmsQuery.prototype.queryLayer = function ( param, config, viewer ) {
        var self = this

        var layerConfig = viewer.layerId[ this.layerId ].config

        var filter = makeCqlClause( this.predicate, param )

        var data = $.extend( {
            service:      "WFS",
            version:      '1.1.0',
            request:      "GetFeature",
            srsName:      'EPSG:4326',
            typename:     layerConfig.layerName,
            outputformat: "application/json",
            cql_filter:   filter,
        }, param.option );

        // if ( config.within ) {
        //     data.geometry = viewer.getView().extent.join( ',' )
        //     data.geometryType = 'esriGeometryEnvelope'
        //     data.spatialRel = 'esriSpatialRelIntersects'
        // }

        return SMK.UTIL.makePromise( function ( res, rej ) {
            $.ajax( {
                url:        layerConfig.serviceUrl,
                method:     'GET',
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
    function makeCqlClause( predicate, param ) {
        return handleCqlOperator( predicate, param )
    }

    function handleCqlOperator( predicate, param ) {
        if ( !( predicate.operator in whereOperator ) )
            throw new Error( 'unknown operator: ' + JSON.stringify( predicate ) )

        return whereOperator[ predicate.operator ]( predicate.arguments, param )
    }

    var whereOperator = {
        'and': function ( args, param ) {
            if ( args.length == 0 ) throw new Error( 'AND needs at least 1 argument' )

            return args.map( function ( a ) { return '( ' + handleCqlOperator( a, param ) + ' )' } ).join( ' AND ' )
        },

        'or': function ( args, param ) {
            if ( args.length == 0 ) throw new Error( 'OR needs at least 1 argument' )

            return args.map( function ( a ) { return '( ' + handleCqlOperator( a, param ) + ' )' } ).join( ' OR ' )
        },

        'equals': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'EQUALS needs exactly 2 arguments' )

            return handleCqlOperand( args[ 0 ], param ) + ' = ' + handleCqlOperand( args[ 1 ], param )
        },

        'less-than': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'LESS-THAN needs exactly 2 arguments' )

            return handleCqlOperand( args[ 0 ], param ) + ' < ' + handleCqlOperand( args[ 1 ], param )
        },

        'greater-than': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'GREATER-THAN needs exactly 2 arguments' )

            return handleCqlOperand( args[ 0 ], param ) + ' > ' + handleCqlOperand( args[ 1 ], param )
        },

        'contains': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'CONTAINS needs exactly 2 arguments' )

            return handleCqlOperand( args[ 0 ], param ) + ' ILIKE \'%' + handleCqlOperand( args[ 1 ], param, false ) + '%\''
        },

        'starts-with': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'STARTS-WITH needs exactly 2 arguments' )

            return handleCqlOperand( args[ 0 ], param ) + ' ILIKE \'' + handleCqlOperand( args[ 1 ], param, false ) + '%\''
        },

        'ends-with': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'ENDS-WITH needs exactly 2 arguments' )

            return handleCqlOperand( args[ 0 ], param ) + ' ILIKE \'%' + handleCqlOperand( args[ 1 ], param, false ) + '\''
        },

        'not': function ( args, param ) {
            if ( args.length != 1 ) throw new Error( 'NOT needs exactly 1 argument' )

            return 'NOT ' + handleCqlOperator( args[ 0 ], param )
        }
    }

    function handleCqlOperand( predicate, param, quote ) {
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
            return ( quote === false ? '' : '\'' ) + escapeCqlParameter( param[ arg.id ].value ) + ( quote === false ? '' : '\'' )
        }
    }

    function escapeCqlParameter( p ) { return p }

} )
