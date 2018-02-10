include.module( 'tool-baseMaps', [ 'smk', 'sidebar', 'base-maps-panel' ], function ( inc ) {

    return {
        order: 2,
        initialize: function ( smk, option ) {
            var sb = smk.getSidebar()

            var model = sb.addPanel( 'baseMaps', {
                button: { title: 'Base Maps', icon: 'map' },
                panel: {
                    center:   null,
                    zoom:     null,
                    current:  smk.viewer.baseMap,
                    basemaps: [
                        { id: 'Topographic', title: 'Topographic' },
                        { id: 'Streets', title: 'Streets' },
                        { id: 'Imagery', title: 'Imagery' },
                        { id: 'Oceans', title: 'Oceans' },
                        { id: 'NationalGeographic', title: 'National Geographic' },
                        { id: 'DarkGray', title: 'Dark Gray' },
                        { id: 'Gray', title: 'Gray' }
                    ]
                },
                startOpen: option.startOpen
            } )

            sb.vm.$on( 'baseMapsPanel.set-base-map', function ( ev ) {
                smk.$viewer.setBasemap( ev.id )
            } )

            smk.$viewer.changedBaseMap( function ( ev ) {
                model.current = ev.baseMap
            } )

            smk.$viewer.changedView( function ( ev ) {
                model.center = ev.center
                model.zoom = ev.zoom
            } )

            var v = smk.$viewer.getView()
            model.center = v.center
            model.zoom = v.zoom

            Vue.component( 'baseMapsPanel', {
                template: inc[ 'base-maps-panel' ],
                props: [ 'basemaps', 'center', 'zoom', 'current' ],
            } )

            // leaflet specific
            Vue.directive( 'map', {
                unbind: function ( el, binding ) {
                    // console.log( 'unbind', binding )
                    binding.value.basemap.map.remove()
                },

                inserted: function ( el, binding ) {
                    // console.log( 'inserted', binding )

                    var map = L.map( el, {
                        attributionControl: false,
                        zoomControl: false,
                        dragging: false,
                        keyboard: false,
                        scrollWheelZoom: false,
                        zoom: 10
                    } );

                    binding.value.basemap.map = map

                    map.addLayer( L.esri.basemapLayer( binding.value.basemap.id, { detectRetina: true } ) )

                    if ( binding.value.center ) {
                        map.setView( binding.value.center, binding.value.zoom )
                    }

                    map.invalidateSize()
                },

                update: function ( el, binding ) {
                    // console.log( 'update', binding )

                    var map = binding.value.basemap.map

                    if ( binding.value.center ) {
                        map.setView( binding.value.center, binding.value.zoom )
                        map.invalidateSize();
                    }
                }
            } )


        }
    }

} )
