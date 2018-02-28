include.module( 'tool-menu', [ 'smk', 'tool', 'widgets', 'tool-menu.panel-menu-html' ], function ( inc ) {

    Vue.component( 'menu-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'menu-panel', {
        template: inc[ 'tool-menu.panel-menu-html' ],
        props: [ 'title', 'visible', 'enabled', 'active', 'subWidgets', 'subPanels', 'activeToolType' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function MenuTool( option ) {
        this.makePropWidget( 'icon', 'menu' )
        this.makePropPanel( 'subWidgets', [] )
        this.makePropPanel( 'subPanels', {} )
        this.makePropPanel( 'activeToolType', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            title:          null,
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
        var self = this

        this.subWidgets.push( {
            type: tool.type,
            widgetComponent: tool.widgetComponent,
            widget: tool.widget
        } )

        Vue.set( this.subPanels, tool.type, {
            panelComponent: tool.panelComponent,
            panel: tool.panel
        } )

        tool.changedActive( function () {
            if ( tool.active )
                self.setActiveTool( tool )
            else
                self.setActiveTool( null )
        } )
    }

    MenuTool.prototype.setActiveTool = function ( tool ) {
        if ( this.activeTool )
            this.activeTool.active = false

        this.activeTool = tool

        if ( this.activeTool ) {
            this.activeTool.active = true
            this.activeToolType = this.activeTool.type
        }
        else {
            this.activeToolType = null
        }
    }
    
    return MenuTool
} )

