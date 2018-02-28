include.module( 'event', [ 'vue', 'util' ], function () {

    function Event ( events ) {
        this.eventDispatch = new Vue()
    }

    SMK.TYPE.Event = Event

    Event.prototype.catchExceptions = true

    Event.prototype.destroy = function () {
        this.eventDispatch.$off()
    }

    Event.define = function ( names ) {
        var subclass = function() {
            Event.prototype.constructor.call( this )
        }

        $.extend( subclass.prototype, Event.prototype )

        names.forEach( function ( n ) {
            subclass.prototype[ n ] = function ( handler ) {
                if ( $.isFunction( handler ) ) {
                    this.eventDispatch.$on( n, handler )
                    return this
                }

                var args = [].slice.call( arguments )
                args.unshift( n )

                try {
                    this.eventDispatch.$emit.apply( this.eventDispatch, args )
                }
                catch ( e ) {
                    if ( this.catchExceptions ) {
                        console.warn( 'Exception caught in %s event handler:\n%o', name, err )
                    }
                    else {
                        err.message = 'Exception caught in ' + name + ' event handler: ' + err.message
                        throw err
                    }
                }
            }
        } )

        return subclass
    }

} )