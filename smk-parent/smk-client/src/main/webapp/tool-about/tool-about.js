include.module( 'tool-about', [ 'smk', 'sidebar', 'about-panel' ], function ( inc ) {

    return {
        order: 1,
        initialize: function ( smk, option ) {
            smk.getSidebar().addPanel( 'about', {
                button: { title: 'About', icon: 'menu' },
                panel: {
                    title: smk.name,
                    about: option.content
                },
                startOpen: option.startOpen
            } )

            Vue.component( 'aboutPanel', {
                template: inc[ 'about-panel' ],
                props: [ 'title', 'about' ]
            } )
        }
    }

} )
