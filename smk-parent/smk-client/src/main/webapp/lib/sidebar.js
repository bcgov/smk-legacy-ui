include.module( 'sidebar', [ 'sidebar-panels', 'vue', 'side-panel', 'sidebar-button' ], function ( inc ) {

    function Sidebar( smk ) {
        var self = this

        this.model = {
            expanded: false,
            currentTool: null,
            tools: [],
            panel: {}
        }

        var el = smk.addToContainer( inc[ 'sidebar-panels' ] )

        this.vm = new Vue( {
            el: el,
            data: this.model
        } )

        this.vm.$on( 'activate-tool', function ( ev ) {
            console.log( 'activate tool:', ev )
            if ( ev.active ) {
                self.model.currentTool = ev.id
            }
            else {
                self.model.currentTool = null
            }

            $( smk.$option.container ).toggleClass( 'smk-panel-expanded', ev.active )
        } )

        Vue.component( 'panel-tool', {
            props: [ 'id', 'title', 'icon', 'active' ],
            template: inc[ 'sidebar-button' ],
            methods: {
                clickTool: function () {
                    this.$root.$emit( 'activate-tool', { id: this.id, active: !this.active } )
                }
            }
        } )

        Vue.component( 'side-panel', {
            template: inc[ 'side-panel' ]
        } )
    }

    Sidebar.prototype.addPanel = function ( id, arg ) {
        arg.button.id = id
        this.model.tools.push( arg.button )

        Vue.set( this.vm.panel, id, arg.panel )

        if ( arg.startOpen )
            this.model.currentTool = id

        return this.vm.panel[ id ]
    }

    SMK.TYPE.Sidebar = Sidebar

    return Sidebar

} )