include.module( 'tool', [ 'smk', 'jquery', 'event' ], function () {

    var ToolEvent = SMK.TYPE.Event.define( [
        'changedVisibility',
        'changedEnable',
        'changedActive'
    ] )

    function Tool( option ) {
        ToolEvent.prototype.constructor.call( this )

        $.extend( this, {
            visible: false,
            enabled: false,
            activated: false,
        }, option )
    }

    SMK.TYPE.Tool = Tool

    $.extend( Tool.prototype, ToolEvent.prototype )

    Tool.prototype.show = function ( show ) {
        if ( !show == !this.visible ) return this

        this.visible = show
        this.changedVisible()

        return this
    }

    Tool.prototype.isVisible = function () {
        return this.visible
    }


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

} )
