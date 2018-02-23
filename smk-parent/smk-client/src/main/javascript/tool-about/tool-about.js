include.module( 'tool-about', [ 'smk', 'tool', 'tool-about.panel-about-html', 'widgets' ], function ( inc ) {

    // return {
    //     order: 1,
    //     initialize: function ( smk, option ) {
    //         smk.getSidebar().addPanel( 'about', {
    //             button: { title: 'About', icon: 'menu' },
    //             panel: {
    //                 title: smk.name,
    //                 about: option.content
    //             },
    //             startOpen: option.startOpen
    //         } )

    //         Vue.component( 'aboutPanel', {
    //             template: inc[ 'tool-about.panel-about-html' ],
    //             props: [ 'title', 'about' ]
    //         } )
    //     }
    // }

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
            // id: 'about',
            title: 'About',
            widget: { icon: 'menu', component: 'about-widget' },
            // icon: 'menu',
            // button: true,
            panel: { component: 'about-panel' },
            panelProperties: SMK.TYPE.Tool.prototype.panelProperties.concat( 'content' )
        }, option ) )
    }

    SMK.TYPE.AboutTool = AboutTool

    $.extend( AboutTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    AboutTool.prototype.initialize = function ( smk ) {
        var self = this

        return SMK.TYPE.Tool.prototype.initialize.apply( this, arguments )
            .then( function ( aux ) {
                aux.toolbar.vm.$on( 'about-widget.click', function () {
                    if ( !self.isVisible() || !self.isEnabled() ) return

                    self.active( !self.isActivated() )
                    // console.log( arguments )
                } )
            } )

        // return smk.getSidepanel().then( function ( panel ) {
        //     panel.add( self )
        // } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    // AboutTool.prototype.onClick = function () {
    //     if ( !this.isVisible() || !this.isEnabled() ) return

    //     this.active( !this.isActivated() )
    // }

    return AboutTool
} )
