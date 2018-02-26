include.module( 'sidepanel', [ 'vue', 'sidepanel.sidepanel-html', 'sidepanel.panel-html' ], function ( inc ) {

    Vue.component( 'side-panel', {
        template: inc[ 'sidepanel.panel-html' ]
    } )

    function Sidepanel( smk ) {
        this.model = {
            expanded: false,
            currentTool: null,
            panel: {}
        }

        var el = smk.addToOverlay( inc[ 'sidepanel.sidepanel-html' ] )

        this.vm = new Vue( {
            el: el,
            data: this.model
        } )
    }

    Sidepanel.prototype.activateTool = function ( toolId, active ) {
        console.log( 'activate tool:', toolId )

        if ( active ) {
            if ( this.model.currentTool )
                this.model.panel[ this.model.currentTool ].active = false

            this.model.currentTool = toolId
        }
        else {
            this.model.currentTool = null
        }

        this.model.expanded = !!active
        // $( smk.$option.container ).toggleClass( 'smk-panel-expanded', ev.active )
    }

    Sidepanel.prototype.add = function ( tool ) {
        var self = this

        this.vm.$set( this.model.panel, tool.type, tool )

        tool.changedActive( function () {
            self.activateTool( tool.type, tool.active )
        } )

        // if ( arg.startOpen )
            // this.model.currentTool = id
    }

    SMK.TYPE.Sidepanel = Sidepanel

    return Sidepanel

} )