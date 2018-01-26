include.module( 'tool-select', [ 'smk', 'sidebar', 'select-panel' ], function ( inc ) {

    return {
        order: 5,
        initialize: function ( smk, option ) {
            var sb = smk.getSidebar()

            var model = sb.addPanel( 'select', {
                button: { title: 'Selection', icon: 'select_all' },
                panel: {
                    busy: false,
                    layers: [],
                    highlightId: null
                }
            } )

            // sb.vm.$on( 'identifyPanel.active', function ( ev ) {
            //     smk.$viewer.identified.pick( ev.feature.id )
            // } )

            // sb.vm.$on( 'identifyPanel.hover', function ( ev ) {
            //     smk.$viewer.identified.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
            // } )

            // sb.vm.$on( 'identifyPanel.add-all', function ( ev ) {
            // } )

            // sb.vm.$on( 'identifyPanel.clear', function ( ev ) {
            //     smk.$viewer.identified.clear()
            // } )

            // smk.$viewer.startedIdentify( function ( ev ) {
            //     model.busy = true
            // } )

            // smk.$viewer.finishedIdentify( function ( ev ) {
            //     model.busy = false
            // } )

            smk.$viewer.selected.addedFeatures( function ( ev ) {
                sb.vm.$emit( 'activate-tool', { active: true, id: 'select' } )

                var ly = smk.$viewer.layerId[ ev.layerId ]

                model.layers[ ly.index ] = {
                    id: ly.config.id,
                    title: ly.config.title,
                    features: ev.features
                }
            } )

            // // smk.$viewer.selected.removedFeatures( function ( ev ) {
            // // } )

            // smk.$viewer.selected.pickedFeature( function ( ev ) {
            //     model.highlightId = ev.feature && ev.feature.id
            // } )

            // // smk.$viewer.selected.highlightedFeatures( function ( ev ) {
            // // } )

            smk.$viewer.selected.clearedFeatures( function ( ev ) {
                model.layers = []
            } )

            Vue.component( 'selectPanel', {
                template: inc[ 'select-panel' ],
                props: [ 'layers', 'busy', 'highlightId' ],
                methods: {
                    isEmpty: function () {
                        return !this.layers || this.layers.length == 0
                    }
                },
            } )

        }
    }

} )
