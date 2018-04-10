include.module( 'widgets', [ 'vue', 'widgets.tool-button-html' ], function ( inc ) {

    var emit = {
        methods: {
            $$emit: function ( event, arg ) {
                this.$root.trigger( this.id, event, arg )
            }
        }
    }

    return {
        emit: emit,

        toolButton: Vue.extend( {
            mixins: [ emit ],
            template: inc[ 'widgets.tool-button-html' ],
            props: [ 'id', 'title', 'visible', 'enabled', 'active', 'icon' ],
        } ),

        toolPanel: Vue.extend( {
            mixins: [ emit ],
            props: [ 'id', 'title', 'visible', 'enabled', 'active' ],
        } )

    }

} )