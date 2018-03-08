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
<<<<<<< HEAD
        this.makePropWidget( 'icon', 'menu' )
        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            title:          'About',
=======
        this.makePropWidget( 'icon', 'help' )
        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            // title:          'About',
>>>>>>> master
            widgetComponent:'about-widget',
            panelComponent: 'about-panel',
            position:       'menu'
        }, option ) )
    }

    SMK.TYPE.AboutTool = AboutTool

    $.extend( AboutTool.prototype, SMK.TYPE.Tool.prototype )
    AboutTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    AboutTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

<<<<<<< HEAD
        aux.toolbar.vm.$on( 'about-widget.click', function () {
=======
        aux.widget.vm.$on( 'about-widget.click', function () {
>>>>>>> master
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )
    } )

    return AboutTool
} )
