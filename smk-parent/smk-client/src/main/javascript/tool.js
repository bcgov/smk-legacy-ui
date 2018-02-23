include.module( 'tool', [ 'smk', 'jquery', 'event' ], function () {

    var ToolEvent = SMK.TYPE.Event.define( [
        'changedVisible',
        'changedEnable',
        'changedActive'
    ] )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function Tool( option ) {
        ToolEvent.prototype.constructor.call( this )

        $.extend( this, {
            // type: 'unknown',
            // order: 1,
            // visible: true,
            // enabled: true,
            // activated: false,
            // toolbarProperties: [ 'type', 'title', 'icon', 'component', 'visible', 'enabled', 'activated' ]
        }, option )
    }

    Tool.prototype.type = 'unknown'
    Tool.prototype.order = 1
    Tool.prototype.title = null
    Tool.prototype.widget = null
    Tool.prototype.panel = null
    Tool.prototype.visible = true
    Tool.prototype.enabled = true
    Tool.prototype.activated = false
    Tool.prototype.toolbarProperties = [ 'type', 'title', 'visible', 'enabled', 'activated', 'widget' ]
    Tool.prototype.panelProperties =   [ 'type', 'title', 'visible', 'enabled', 'activated', 'panel' ]

    SMK.TYPE.Tool = Tool

    $.extend( Tool.prototype, ToolEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Tool.prototype.initialize = function ( smk ) {
        var self = this

        var aux = {}
        return SMK.UTIL.waitAll( [
            smk.getToolbar().then( function ( toolbar ) { aux.toolbar = toolbar } ),
            smk.getSidepanel().then( function ( panel ) { aux.panel = panel } )
        ] )
        .then( function () {
            if ( self.widget )
                aux.toolbar.add( self )

            if ( self.panel )
                aux.panel.add( self )

            return aux
        } )

        // return Promise.resolve( {} )
        //     .then( function () {
        //         if ( self.widget )
        //             return smk.getToolbar().then( function ( toolbar ) {
        //                 toolbar.add( self )
        //                 console.log( 'widget "' + self.type + '" added' )
        //                 return { toolbar: toolbar }
        //             } )
        //     } )
        //     .then( function () {
        //         if ( self.panel )
        //             return smk.getSidepanel().then( function ( panel ) {
        //                 panel.add( self )
        //                 console.log( 'panel "' + self.type + '" added' )
        //                 return panel
        //             } )
        //     } )
    }

    Tool.prototype.getView = function ( props ) {
        var self = this

        var view = {}
        props.forEach( function ( p ) {
            Object.defineProperty( view, p, { get: function () { return self[ p ] } } )
        } )
        return { tool: view }
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Tool.prototype.show = function ( show ) {
        if ( !show == !this.visible ) return this

        this.visible = show
        this.changedVisible()

        return this
    }

    Tool.prototype.isVisible = function () {
        return this.visible
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Tool.prototype.enable = function ( enable ) {
        if ( !enable == !this.enabled ) return this

        this.enabled = enable
        this.changedEnable()

        if ( !this.enabled )
            this.active( false )

        return this
    }

    Tool.prototype.isEnabled = function () {
        return this.enabled
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Tool.prototype.active = function ( active ) {
        if ( !active == !this.activated ) return this

        if ( active && !this.isEnabled() ) return this

        this.activated = active
        this.changedActive()

        return this
    }

    Tool.prototype.isActivated = function () {
        return this.activated
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Tool.prototype.onClick = function () {
        console.log( 'unhandled' )
        // if ( !this.isVisible() || !this.isEnabled() ) return
    }

    return Tool
} )


 HK0qHyU4xdFBpT