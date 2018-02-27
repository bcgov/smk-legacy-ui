include.module( 'tool-about', [ 'smk', 'tool', 'widgets', 'tool-about.panel-about-html' ], function ( inc ) {

    Vue.component( 'about-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'about-panel', {
        template: inc[ 'tool-about.panel-about-html' ],
        props: [ 'title', 'content' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function AboutTool( option ) {
        this.makePropWidget( 'icon', 'menu' )
        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            title:          'About',
            widgetComponent:'about-widget',
            panelComponent: 'about-panel',
        }, option ) )
    }

    SMK.TYPE.AboutTool = AboutTool

    $.extend( AboutTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    AboutTool.prototype.afterInitialize = function ( smk, aux ) {
        var self = this

        aux.toolbar.vm.$on( 'about-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
            // console.log( arguments )
        } )
    }

    return AboutTool
} )
