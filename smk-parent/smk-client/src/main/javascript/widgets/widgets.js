include.module( 'widgets', [ 'vue', 'widgets.tool-button-html' ], function ( inc ) {

    return {
        toolButton: Vue.extend( {
            props: [ 'tool' ],
            template: inc[ 'widgets.tool-button-html' ]
        } )
    }
    
} )