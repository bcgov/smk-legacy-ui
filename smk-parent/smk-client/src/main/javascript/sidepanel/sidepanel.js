include.module( 'sidepanel', [ 'vue', 'sidepanel.sidepanel-html', 'sidepanel.panel-html' ], function ( inc ) {

    Vue.component( 'side-panel', {
        template: inc[ 'sidepanel.panel-html' ]
    } )

    function Sidepanel( smk ) {
        this.model = {
            expanded: false,
            activeTool: null,
            tool: {}
        }

        var el = smk.addToOverlay( inc[ 'sidepanel.sidepanel-html' ] )

        this.vm = new Vue( {
            el: el,
            data: this.model
        } )

        this.container = $( smk.$option.container )
    }

    Sidepanel.prototype.setActiveTool = function ( tool ) {
        if ( this.activeTool )
            this.activeTool.active = false

        this.activeTool = tool

        if ( this.activeTool ) {
            this.activeTool.active = true
            this.model.activeTool = this.activeTool.type
            this.model.expanded = true
            this.container.addClass( 'smk-panel-expanded' )
        }
        else {
            this.model.activeTool = null
            this.model.expanded = false
            this.container.removeClass( 'smk-panel-expanded' )
        }
    }

    Sidepanel.prototype.add = function ( tool ) {
        var self = this

        this.vm.$set( this.model.tool, tool.type, {
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

    SMK.TYPE.Sidepanel = Sidepanel

    return Sidepanel

} )