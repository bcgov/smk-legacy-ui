include.module( 'tool-baseMaps', [ 'smk', 'sidebar', 'tool-baseMaps.panel-base-maps-html' ], function ( inc ) {

    var baseMapTitle = {
        Topographic: 'Topographic',
        Streets: 'Streets',
        Imagery: 'Imagery',
        Oceans: 'Oceans',
        NationalGeographic: 'National Geographic',
        DarkGray: 'Dark Gray',
        Gray: 'Gray',
    }

    return {
        order: 2,
        initialize: function ( smk, option ) {
            var sb = smk.getSidebar()

            var choices = [ 'Topographic', 'Streets', 'Imagery', 'Oceans', 'NationalGeographic', 'DarkGray', 'Gray' ]
            if ( option.choices && option.choices.length > 0 )
                choices = option.choices

            if ( !choices.includes( smk.viewer.baseMap ) )
                choices.unshift( smk.viewer.baseMap )

            var model = sb.addPanel( 'baseMaps', {
                button: { title: 'Base Maps', icon: 'map' },
                panel: {
                    center:   null,
                    zoom:     null,
                    current:  smk.viewer.baseMap,
                    basemaps: choices.map( function ( c ) {
                        return {
                            id: c, title: baseMapTitle[ c ]
                        }
                    } )
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
                template: inc[ 'tool-baseMaps.panel-base-maps-html' ],
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
