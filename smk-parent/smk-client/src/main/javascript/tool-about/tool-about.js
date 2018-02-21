include.module( 'tool-about', [ 'smk', 'tool', 'tool-about.panel-about-html' ], function ( inc ) {

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

    Vue.component( 'aboutPanel', {
        template: inc[ 'tool-about.panel-about-html' ],
        props: [ 'title', 'about' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function AboutTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            // id: 'about',
            title: 'About',
            icon: 'menu',
            button: true,
            panel: 'aboutPanel',
            component: 'tool-button'
        }, option ) )
    }

    SMK.TYPE.AboutTool = AboutTool

    $.extend( AboutTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    // AboutTool.prototype.initialize = function ( smk ) {
    //     return SMK.TYPE.Tool.prototype.initialize.apply( this, arguments )

    //     // return smk.getSidepanel().then( function ( panel ) {
    //     //     panel.add( self )
    //     // } )
    // }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    AboutTool.prototype.onClick = function () {
        if ( !this.isVisible() || !this.isEnabled() ) return

        this.active( !this.isActivated() )
    }

    return AboutTool
} )
