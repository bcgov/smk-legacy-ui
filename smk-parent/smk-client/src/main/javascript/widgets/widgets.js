include.module( 'widgets', [ 'vue', 'widgets.tool-button-html' ], function ( inc ) {

    var widget = {}

    widget.toolButton = Vue.extend( {
        props: [ 'tool' ],
        template: inc[ 'widgets.tool-button-html' ]
    } )

    return widget

} )