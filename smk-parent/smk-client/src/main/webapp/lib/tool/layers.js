include.module( 'tool-layers', [ 'smk', 'sidebar', 'layers-panel' ], function ( inc ) {
    return {
        order: 3,
        initialize: function ( smk, option ) {
            var sb = smk.getSidebar()

            var layerModel = {}
            var model = sb.addPanel( 'layers', {
                button: { title: 'Layers', icon: 'layers' },
                panel: {
                    busy:     false,
                    layers:   smk.$viewer.layerIds.map( function ( id, i ) {
                        var ly = smk.$viewer.layerId[ id ]

                        return layerModel[ id ] = {
                            id:             id,
                            title:          ly.config.title,
                            visible:        ly.config.isVisible,
                            expanded:       false,
                            legends:        null
                        }
                    } )
                }
            } )


            sb.vm.$on( 'layersPanel.set-visible', function ( ev ) {
                ev.ids.forEach( function ( id ) { layerModel[ id ].visible = ev.visible } )
                smk.$viewer.setLayersVisible( ev.ids, ev.visible )
            } )

            sb.vm.$on( 'layersPanel.set-expanded', function ( ev ) {
                ev.ids.forEach( function ( id ) {
                    var ly = layerModel[ id ]
                    ly.expanded = ev.expanded

                    if ( ly.expanded && ly.legends == null ) {
                        ly.legends = 'waiting'
                        smk.$viewer.layerId[ id ].getLegends()
                            .then( function ( ls ) {
                                ly.legends = ls
                            }, function () {
                                ly.legends = false
                            } )
                    }
                } )
            } )

            smk.$viewer.startedLoading( function ( ev ) {
                model.busy = true
            } )

            smk.$viewer.finishedLoading( function ( ev ) {
                model.busy = false
            } )

            Vue.component( 'layersPanel', {
                template: inc[ 'layers-panel' ],
                props: [ 'layers', 'busy' ],
                data: function () {
                    return {
                        filter: null
                    }
                },
                methods: {
                    isAllVisible: function () {
                        return this.layers.every( isVisible ) || ( this.layers.some( isVisible ) ? null : false )

                        function isVisible( ly ) { return ly.visible }
                    },

                    matchesFilter: function ( layer ) {
                        return this.filterRegExp.test( layer.title )
                    },

                    allLayerIds: function () {
                        return this.layers.map( function ( l ) { return l.id } )
                    },
                },
                computed: {
                    filterRegExp: function () {
                        if ( !this.filter ) return /.*/;
                        var f = this.filter.trim()
                        if ( !f ) return /.*/;
                        return new RegExp( f.toLowerCase().split( /\s+/ ).map( function ( part ) { return '(?=.*' + part + ')' } ).join( '' ), 'i' )
                    }
                }
            } )

        }
    }

} )
