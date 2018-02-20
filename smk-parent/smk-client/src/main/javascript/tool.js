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
            type: 'unknown',
            order: 1,
            visible: false,
            enabled: false,
            activated: false,
        }, option )
    }

    SMK.TYPE.Tool = Tool

    $.extend( Tool.prototype, ToolEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Tool.prototype.initialize = function ( smk ) {
        var self = this

        return Promise.resolve()
            .then( function () {
                if ( self.button )
                    return smk.getToolbar().then( function ( toolbar ) {
                        toolbar.add( self )
                        console.log( 'button "' + self.type + '" added' )
                    } )
            } )
            .then( function () {
                if ( self.panel )
                    return smk.getSidepanel().then( function ( panel ) {
                        panel.add( self )
                        console.log( 'panel "' + self.type + '" added' )
                    } )
            } )
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
