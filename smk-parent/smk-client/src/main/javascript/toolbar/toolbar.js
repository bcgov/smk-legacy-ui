include.module( 'toolbar', [ 'vue', 'toolbar.toolbar-html' ], function ( inc ) {

    // Vue.component( 'tool-button', {
    //     props: [ 'tool' ],
    //     template: inc[ 'toolbar.tool-button-html' ]
    // } )

    function Toolbar( smk ) {
        var self = this

        this.model = {
            // expanded: false,
            // currentTool: null,
            tools: [],
            // panel: {}
        }

        var el = smk.addToOverlay( inc[ 'toolbar.toolbar-html' ] )

        this.vm = new Vue( {
            el: el,
            data: this.model,
            methods: {
                debug: function ( x ) { console.log( arguments ); return x },
                // $$emit: function ( event, arg ) {
                //     // if ( this.$options._componentTag )
                //     //     event = this.$options._componentTag + '.' + event

                //     this.$root.$emit( event, arg )
                // }
            },
            // updated: function () {
            //     console.log( this )
            // }
        } )

        this.vm.$on( 'click', function ( ev ) {
            console.log( ev )
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

        // Vue.component( 'side-panel', {
        //     template: inc[ 'side-panel' ]
        // } )
    }

    Toolbar.prototype.add = function ( tool ) {
        // arg.button.id = id
        this.model.tools.push( tool )

        // Vue.set( this.vm.panel, id, arg.panel )

        // if ( arg.startOpen )
            // this.model.currentTool = id

        // return this.vm.panel[ id ]
    }

    SMK.TYPE.Toolbar = Toolbar

    return Toolbar

} )