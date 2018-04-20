include.module( 'query', [ 'jquery', 'util', 'event' ], function () {

    var QueryEvent = SMK.TYPE.Event.define( [
        // 'startedLoading',
        // 'finishedLoading',
    ] )

    function Query( layer, config ) {
        var self = this

        QueryEvent.prototype.constructor.call( this )

        $.extend( this, {
            layer: layer
        }, config )

        this.id = layer.id + '--' + this.id
        // var loading = false
        // Object.defineProperty( this, 'loading', {
        //     get: function () { return loading },
        //     set: function ( v ) {
        //         if ( !!v == loading ) return
        //         // console.log( self.config.id, v )
        //         loading = !!v
        //         if ( v )
        //             self.startedLoading()
        //         else
        //             self.finishedLoading()
        //     }
        // } )
    }

    $.extend( Query.prototype, QueryEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Query.prototype.getParameters = function () {
        var self = this;

        return this.parameters.map( function ( p ) {
            return {
                id: self.id + '--' + p.id,
                component: 'parameter-' + p.type,
                prop: $.extend( true, { value: null }, p ),
                initial: p.value
            }
        } )
    }


    Query.prototype.queryLayer = function ( arg ) {
        console.log( 'not implemented', arg )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Query = {}

    function defineQueryType( name, def ) {
        var qt = function () {
            Query.prototype.constructor.apply( this, arguments )
        }

        $.extend( qt.prototype, Query.prototype, def )

        SMK.TYPE.Query[ name ] = qt
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'folder' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'group' )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'wms', {
    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'esri-dynamic', {

        queryLayer: function ( param, config, viewer ) {
            var self = this

            if ( this.layer.config.dynamicLayers.length != 1 )
                throw new Error( 'more than one dynamic layer def' )

            var serviceUrl  = this.layer.config.serviceUrl + '/dynamicLayer/query'

            var dynamicLayer = JSON.parse( this.layer.config.dynamicLayers[ 0 ] )
            delete dynamicLayer.drawingInfo

            var whereClause = makeWhereClause( this.predicate, param )

            var attrs = this.layer.config.attributes.filter( function ( a ) { return a.visible !== false } ).map( function ( a ) { return a.name } )

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
                    if ( self.layer.config.titleAttribute )
                        f.title = f.properties[ self.layer.config.titleAttribute ]
                    else
                        f.title = 'Feature #' + ( i + 1 )

                    return f
                } )
            } )
        }

    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'kml', {
    } )

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    defineQueryType( 'vector', {

        queryLayer: function ( param, config, viewer, layerId ) {
            var self = this

            var test = makeTest( this.predicate, param )

            var features = []
            viewer.visibleLayer[ layerId ].eachLayer( function ( ly ) {
                if ( test( ly.feature.properties ) )
                    features.push( ly.feature )
            } )

            return SMK.UTIL.resolved( features )
                .then( function ( features ) {
                    console.log( features )

                    if ( !features || features.length == 0 ) throw new Error( 'no features' )

                    return features.map( function ( f, i ) {
                        if ( self.layer.config.titleAttribute )
                            f.title = f.properties[ self.layer.config.titleAttribute ]
                        else
                            f.title = 'Feature #' + ( i + 1 )

                        return f
                    } )
                } )
            // var whereClause = makeWhereClause( this.predicate, param )

            // var attrs = this.layer.config.attributes.filter( function ( a ) { return a.visible !== false } ).map( function ( a ) { return a.name } )

            // var data = {
            //     f:                  'geojson',
            //     layer:              JSON.stringify( dynamicLayer ).replace( /^"|"$/g, '' ),
            //     where:              whereClause,
            //     outFields:          attrs.join( ',' ),
            //     inSR:               4326,
            //     outSR:              4326,
            //     returnGeometry:     true,
            //     returnZ:            false,
            //     returnM:            false,
            //     returnIdsOnly:      false,
            //     returnCountOnly:    false,
            //     returnDistinctValues:   false,
            // }

            // if ( config.within ) {
            //     data.geometry = viewer.getView().extent.join( ',' )
            //     data.geometryType = 'esriGeometryEnvelope'
            //     data.spatialRel = 'esriSpatialRelIntersects'
            // }

            // return SMK.UTIL.makePromise( function ( res, rej ) {
            //     $.ajax( {
            //         url:        serviceUrl,
            //         method:     'POST',
            //         data:       data,
            //         dataType:   'json',
            //         // contentType:    'application/json',
            //         // crossDomain:    true,
            //         // withCredentials: true,
            //     } ).then( res, rej )
            // } )
            // .then( function ( data ) {
            //     console.log( data )

            //     if ( !data ) throw new Error( 'no features' )
            //     if ( !data.features || data.features.length == 0 ) throw new Error( 'no features' )

            //     return data.features.map( function ( f, i ) {
            //         if ( self.layer.config.titleAttribute )
            //             f.title = f.properties[ self.layer.config.titleAttribute ]
            //         else
            //             f.title = 'Feature #' + ( i + 1 )

            //         return f
            //     } )
            // } )
        }

    } )

    function makeTest( predicate, param ) {
        return makeTestOperator( predicate, param )
    }

    function makeTestOperator( predicate, param ) {
        if ( !( predicate.operator in testOperator ) )
            throw new Error( 'unknown operator: ' + JSON.stringify( predicate ) )

        return testOperator[ predicate.operator ]( predicate.arguments, param )        
    }

    var testOperator = {
        'and': function ( args, param ) {
            if ( args.length == 0 ) throw new Error( 'AND needs at least 1 argument' )

            var tests = args.map( function ( a ) {
                return makeTestOperator( a, param )
            } )

            return function ( properties ) {
                return tests.every( function ( t ) {
                    return t( properties )
                } )
            }
        },

        'or': function ( args, param ) {
            if ( args.length == 0 ) throw new Error( 'AND needs at least 1 argument' )

            var tests = args.map( function ( a ) {
                return makeTestOperator( a, param )
            } )

            return function ( properties ) {
                return tests.some( function ( t ) {
                    return t( properties )
                } )
            }
        },

        'equals': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'EQUALS needs exactly 2 arguments' )

            var a = makeTestOperand( args[ 0 ], param )
            var b = makeTestOperand( args[ 1 ], param )

            return function ( properties ) {
                return a( properties ) == b( properties )
            }
        },

        'less-than': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'LESS-THAN needs exactly 2 arguments' )

            var a = makeTestOperand( args[ 0 ], param )
            var b = makeTestOperand( args[ 1 ], param )

            return function ( properties ) {
                return a( properties ) < b( properties )
            }
        },

        'greater-than': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'GREATER-THAN needs exactly 2 arguments' )

            var a = makeTestOperand( args[ 0 ], param )
            var b = makeTestOperand( args[ 1 ], param )

            return function ( properties ) {
                return a( properties ) > b( properties )
            }
        },

        'contains': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'CONTAINS needs exactly 2 arguments' )

            var a = makeTestOperand( args[ 0 ], param )
            var b = makeTestOperand( args[ 1 ], param )

            return function ( properties ) {
                return ( new RegExp( b( properties ), 'i' ) ).test( a( properties ) )
            }
        },

        'starts-with': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'STARTS-WITH needs exactly 2 arguments' )

            var a = makeTestOperand( args[ 0 ], param )
            var b = makeTestOperand( args[ 1 ], param )

            return function ( properties ) {
                return ( new RegExp( '^' + b( properties ), 'i' ) ).test( a( properties ) )
            }
        },

        'ends-with': function ( args, param ) {
            if ( args.length != 2 ) throw new Error( 'ENDS-WITH needs exactly 2 arguments' )

            var a = makeTestOperand( args[ 0 ], param )
            var b = makeTestOperand( args[ 1 ], param )

            return function ( properties ) {
                return ( new RegExp( b( properties ) + '$', 'i' ) ).test( a( properties ) )
            }
        },

        'not': function ( args, param ) {
            if ( args.length != 1 ) throw new Error( 'NOT needs exactly 1 argument' )

            var a = makeTestOperator( args[ 0 ], param )

            return function ( properties ) {
                return ! a( properties )
            }
        }        
    }

    function makeTestOperand( predicate, param ) {
        if ( !( predicate.operand in testOperand ) )
            throw new Error( 'unknown operand: ' + JSON.stringify( predicate ) )

        return testOperand[ predicate.operand ]( predicate, param )
    }

    var testOperand = {
        'attribute': function ( arg, param, quote ) {
            return function ( properties ) {
                return properties[ arg.name ]
            }
        },

        'parameter': function ( arg, param, quote ) {
            return function ( properties ) {
                return param[ arg.id ].value
            }
        }
    }
    
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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
