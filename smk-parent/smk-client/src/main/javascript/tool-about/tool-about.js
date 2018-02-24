include.module( 'tool-about', [ 'smk', 'tool', 'widgets', 'tool-about.panel-about-html' ], function ( inc ) {

    Vue.component( 'about-widget', {
        extends: inc.widgets.toolButton,
        // template: inc[ 'tool-about.panel-about-html' ],
        // props: [ 'title', 'about' ]
    } )

    Vue.component( 'about-panel', {
        template: inc[ 'tool-about.panel-about-html' ],
        props: [ 'tool' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function AboutTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            title: 'About',
            widget: { icon: 'menu', component: 'about-widget' },
            panel: { component: 'about-panel' },
            panelProperties: SMK.TYPE.Tool.prototype.panelProperties.concat( 'content' )
        }, option ) )
    }

    SMK.TYPE.AboutTool = AboutTool

    $.extend( AboutTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    AboutTool.prototype.afterInitialize = function ( smk, aux ) {
        var self = this

        aux.toolbar.vm.$on( 'about-widget.click', function () {
            if ( !self.isVisible() || !self.isEnabled() ) return

            self.active( !self.isActivated() )
            // console.log( arguments )
        } )
    }

    return AboutTool
} )
