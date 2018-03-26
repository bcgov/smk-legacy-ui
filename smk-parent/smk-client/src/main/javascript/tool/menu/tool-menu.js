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

        self.changedActive( function () {
            if ( self.selectedTool )
                self.selectedTool.active = self.active
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

        if ( !this.selectedTool )
            this.selectedTool = tool

        tool.changedActive( function () {
            if ( tool.active ) {
                if ( self.selectedTool.type != tool.type ) {
                    var prev = self.selectedTool
                    self.selectedTool = tool
                    prev.active = false
                }
                self.active = true
            }
            else {
                if ( self.selectedTool.type == tool.type && self.active )
                    tool.active = true
            }

            if ( tool.type == self.selectedTool.type )
                self.activeToolType = tool.active ? tool.type : null
        } )
    }

    return MenuTool
} )

