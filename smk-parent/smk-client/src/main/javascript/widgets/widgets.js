include.module( 'widgets', [ 'vue', 'widgets.tool-button-html' ], function ( inc ) {

    return {
        toolButton: Vue.extend( {
            props: [ 'title', 'visible', 'enabled', 'active', 'icon', 'type' ],
            template: inc[ 'widgets.tool-button-html' ]
        } )
    }

} )