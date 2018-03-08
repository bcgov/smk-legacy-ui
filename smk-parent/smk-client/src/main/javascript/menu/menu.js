include.module( 'menu', [ 'smk' ], function ( inc ) {

    function Menu( smk ) {
        var self = this

        this.containerPromise = new Promise( function ( res, rej ) {
            self.setContainer = function ( tool ) {
                res( tool )
            }
        } )
    }

    Menu.prototype.add = function ( tool ) {
        this.containerPromise.then( function ( container ) {
            container.add( tool )
        } )
    }

    SMK.TYPE.Menu = Menu

    return Menu

} )