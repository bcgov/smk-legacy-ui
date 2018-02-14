include.module( 'tool-identify', [ 'smk', 'sidebar', 'tool-identify.panel-identify-html', 'tool-identify.popup-identify-html' ], function ( inc ) {

    return {
        order: 4,
        initialize: function ( smk, option ) {
            var sb = smk.getSidebar()

            var model = sb.addPanel( 'identify', {
                button: { title: 'Identify', icon: 'search' },
                panel: {
                    busy: false,
                    layers: [],
                    highlightId: null
                }
            } )

            sb.vm.$on( 'identifyPanel.active', function ( ev ) {
                smk.$viewer.identified.pick( ev.feature.id )
            } )

            sb.vm.$on( 'identifyPanel.hover', function ( ev ) {
                smk.$viewer.identified.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
            } )

            sb.vm.$on( 'identifyPanel.add-all', function ( ev ) {
            } )

            sb.vm.$on( 'identifyPanel.clear', function ( ev ) {
                smk.$viewer.identified.clear()
            } )

            smk.$viewer.startedIdentify( function ( ev ) {
                model.busy = true
            } )

            smk.$viewer.finishedIdentify( function ( ev ) {
                model.busy = false
            } )

            smk.$viewer.identified.addedFeatures( function ( ev ) {
                sb.vm.$emit( 'activate-tool', { active: true, id: 'identify' } )

                var ly = smk.$viewer.layerId[ ev.layerId ]

                model.layers[ ly.index ] = {
                    id: ly.config.id,
                    title: ly.config.title,
                    features: ev.features
                }
            } )

            // smk.$viewer.identified.removedFeatures( function ( ev ) {
            // } )

            smk.$viewer.identified.pickedFeature( function ( ev ) {
                model.highlightId = ev.feature && ev.feature.id
            } )

            // smk.$viewer.identified.highlightedFeatures( function ( ev ) {
            // } )

            smk.$viewer.identified.clearedFeatures( function ( ev ) {
                model.layers = []
            } )

            Vue.component( 'identifyPanel', {
                template: inc[ 'tool-identify.panel-identify-html' ],
                props: [ 'layers', 'busy', 'highlightId' ],
                methods: {
                    isEmpty: function () {
                        return !this.layers || this.layers.length == 0
                    }
                },
            } )


            var el = smk.addToContainer( inc[ 'tool-identify.popup-identify-html' ] )

            var popupModel = {
                feature: null,
                layer: null
            }

            var vm = new Vue( {
                el: el,
                data: popupModel,
                methods: {
                    debug: function ( x ) {
                        console.log( arguments )
                        return x
                    },
                    zoomToFeature: function ( layer, feature ) {
                        return smk.$viewer.zoomToFeature( layer, feature )
                    },
                    directionsToFeature: function ( layer, feature ) {
                        return smk.$viewer.directionsToFeature( layer, feature )
                    },
                    selectFeature: function ( layer, feature ) {
                        smk.$viewer.selected.add( layer.config.id, [ feature ] )
                    }
                }
            } )

            smk.$viewer.identified.pickedFeature( function ( ev ) {
                if ( !ev.feature ) return

                popupModel.feature = ev.feature
                popupModel.layer = smk.$viewer.layerId[ ev.feature.layerId ]
            } )

            smk.$viewer.getIdentifyPopupEl = function () { return vm.$el }
        }
    }

} )
