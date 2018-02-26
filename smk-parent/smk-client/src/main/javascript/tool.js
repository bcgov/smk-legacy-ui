include.module( 'tool', [ 'smk', 'jquery', 'event' ], function () {

    var ToolEvent = SMK.TYPE.Event.define( [
        'changedVisible',
        'changedEnabled',
        'changedActive'
    ] )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function Tool( option ) {
        ToolEvent.prototype.constructor.call( this )

        RW( this, 'visible', true, 'changedVisible' )
        RW( this, 'enabled', true, 'changedEnabled' )
        RW( this, 'active', false, 'changedActive' )

        $.extend( this, option )
    }

    Tool.prototype.type = 'unknown'
    Tool.prototype.order = 1
    Tool.prototype.title = null
    Tool.prototype.widget = null
    Tool.prototype.panel = null

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

            return self.afterInitialize( smk, aux )
        } )
    }

    Tool.prototype.afterInitialize = function ( smk, aux ) {}
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Tool.prototype.getToolView = function () {
        var self = this;
        return {
            get type() { return self.type },
            get title() { return self.title },
            get visible() { return self.visible },
            get enabled() { return self.enabled },
            get active() { return self.active }
        }
    }

    Tool.prototype.getWidget = function () {
        var self = this;
        return Object.assign( this.getToolView(), {
            get widget() { return self.widget }
        } )
    }

    Tool.prototype.getPanel = function () {
        var self = this;
        return Object.assign( this.getToolView(), {
            get panel() { return self.panel }
        } )
    }

    return Tool
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function RW( obj, name, initial, event ) {
        var val = initial
        Object.defineProperty( obj, name, {
            get: function () { return val },
            set: function ( v ) {
                if ( !v == !val ) return
                val = v
                if ( event ) obj[ event ].call( obj )
                return obj
            }
        } )

    }

} )
