include.module( 'tool-menu', [ 'smk', 'tool', 'widgets', 'tool-menu.panel-menu-html' ], function ( inc ) {

    Vue.component( 'menu-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'menu-panel', {
        template: inc[ 'tool-menu.panel-menu-html' ],
        props: [ 'title', 'widgets', 'panels' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function MenuTool( option ) {
        this.makePropWidget( 'icon', 'menu' )
        this.makePropPanel( 'widgets', [] )
        this.makePropPanel( 'panels', {} )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            title:          'Menu',
            widgetComponent:'menu-widget',
            panelComponent: 'menu-panel',
        }, option ) )
    }

    SMK.TYPE.MenuTool = MenuTool

    $.extend( MenuTool.prototype, SMK.TYPE.Tool.prototype )
    MenuTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    MenuTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        aux.toolbar.vm.$on( 'menu-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        aux.menu.setContainer( this )
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    MenuTool.prototype.add = function ( tool ) {
        this.widgets.push( {
            type: tool.type,
            widgetComponent: tool.widgetComponent,
            widget: tool.widget
        } )
    }

    return MenuTool
} )

