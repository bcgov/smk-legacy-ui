include.module( 'sidepanel', [ 'vue', 'sidepanel.sidepanel-html', 'sidepanel.panel-html' ], function ( inc ) {

    Vue.component( 'side-panel', {
        template: inc[ 'sidepanel.panel-html' ]
    } )

    function Sidepanel( smk ) {
        this.model = {
            expanded: false,
            currentTool: null,
            // panels: [],
            panel: {}
        }

        var el = smk.addToOverlay( inc[ 'sidepanel.sidepanel-html' ] )

        this.vm = new Vue( {
            el: el,
            data: this.model
        } )

        // this.vm.$on( 'activate-tool', function ( ev ) {
        //     console.log( 'activate tool:', ev )
        //     if ( ev.active ) {
        //         self.model.currentTool = ev.id
        //     }
        //     else {
        //         self.model.currentTool = null
        //     }

        //     $( smk.$option.container ).toggleClass( 'smk-panel-expanded', ev.active )
        // } )

        // Vue.component( 'panel-tool', {
        //     props: [ 'id', 'title', 'icon', 'active' ],
        //     template: inc[ 'sidebar-button' ],
        //     methods: {
        //         clickTool: function () {
        //             this.$root.$emit( 'activate-tool', { id: this.id, active: !this.active } )
        //         }
        //     }
        // } )

    }

    Sidepanel.prototype.activateTool = function ( toolId, active ) {
        console.log( 'activate tool:', toolId )

        if ( active ) {
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
        // arg.button.id = id
        // this.model.panels.push( tool )
        this.vm.$set( this.model.panel, tool.type, tool )
        // this.model.panel[ tool.type ] = tool

        tool.changedActive( function () {
            // if ( !tool.isActive() ) return

            self.activateTool( tool.type, tool.isActivated() )
        } )
        // Vue.set( this.vm.panel, id, arg.panel )

        // if ( arg.startOpen )
            // this.model.currentTool = id

        // return this.vm.panel[ id ]
    }

    SMK.TYPE.Sidepanel = Sidepanel

    return Sidepanel

} )