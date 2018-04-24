include.module( 'query', [ 'jquery', 'util', 'event' ], function () {

    var QueryEvent = SMK.TYPE.Event.define( [
        // 'startedLoading',
        // 'finishedLoading',
    ] )

    function Query( layerId, config ) {
        var self = this

        QueryEvent.prototype.constructor.call( this )

        Object.assign( this, config )
        this.layerId = layerId
        this.id = this.layerId + '--' + this.id
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

    SMK.TYPE.Query = Query
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

    Query.prototype.makeRequest = function ( option, resultFilter, onStateChange ) {
        var self = this

        this.abortRequestInProgress()

        this.requestInProgress = SMK.UTIL.makeRequest( option )
        this.requestInProgress.changedState( function () { onStateChange( this.requestInProgres.state ) } )

        this.requestInProgress.start( resultFilter )

        return this.requestInProgress
    }

    Query.prototype.abortRequestInProgress = function () {
        if ( this.requestInProgress )
            this.requestInProgress.abort()

        this.requestInProgress = null
    }
} )
