include.module( 'widgets', [ 'vue', 'widgets.tool-button-html' ], function ( inc ) {

    return {
        toolButton: Vue.extend( {
            template: inc[ 'widgets.tool-button-html' ],
            props: [ 'title', 'visible', 'enabled', 'active', 'icon', 'id' ],
            methods: {
                $$emit: function ( event, arg ) {
                    this.$root.trigger( this.id + '.' + event, arg )
                }
            }
        } ),

        toolPanel: Vue.extend( {
            props: [ 'id', 'title' ],
            methods: {
                $$emit: function ( event, arg ) {
                    this.$root.trigger( this.id + '.' + event, arg )
                }
            }
        } )
        
    }

} )