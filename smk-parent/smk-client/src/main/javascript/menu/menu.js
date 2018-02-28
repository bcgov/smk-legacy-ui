include.module( 'menu', [ 'vue', 'menu.menu-sidepanel-html', 'menu.menu-toolbar-html' ], function ( inc ) {

    Vue.component( 'menu-sidepanel', {
        template: inc[ 'menu.menu-sidepanel-html' ]
    } )

    Vue.component( 'menu-toolbar', {
        template: inc[ 'menu.menu-toolbar-html' ],
        props: [ 'tools' ]
    } )

    function Menu( smk ) {
        var self = this

        this.containerPromise = new Promise( function ( res, rej ) {
            self.setContainer = function ( tool ) {
                res( tool )
            }
        } )

        // this.model = {
        //     expanded: false,
        //     activeTool: null,
        //     tools: []
        // }

        // var el = smk.addToOverlay( inc[ 'menu.menu-html' ] )

        // this.vm = new Vue( {
        //     el: el,
        //     data: this.model
        // } )

        // this.container = $( smk.$option.container )
    }

    // Menu.prototype.setActiveTool = function ( tool ) {
    //     if ( this.activeTool )
    //         this.activeTool.active = false

    //     this.activeTool = tool

    //     if ( this.activeTool ) {
    //         this.activeTool.active = true
    //         this.model.activeTool = this.activeTool.type
    //         this.model.expanded = true
    //         this.container.addClass( 'smk-panel-expanded' )
    //     }
    //     else {
    //         this.model.activeTool = null
    //         this.model.expanded = false
    //         this.container.removeClass( 'smk-panel-expanded' )
    //     }
    // }

    Menu.prototype.add = function ( tool ) {
        // var self = this

        // this.vm.$set( this.model.tool, tool.type, {
        //     panelComponent: tool.panelComponent,
        //     panel: tool.panel
        // } )

        // tool.changedActive( function () {
        //     if ( tool.active )
        //         self.setActiveTool( tool )
        //     else
        //         self.setActiveTool( null )
        // } )

        this.containerPromise.then( function ( container ) {
            container.add( tool )
        } )
    }

    SMK.TYPE.Menu = Menu

    return Menu

} )