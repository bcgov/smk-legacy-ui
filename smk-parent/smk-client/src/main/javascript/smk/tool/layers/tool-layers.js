include.module( 'tool-layers', [ 'tool', 'widgets', 'tool-layers.panel-layers-html' ], function ( inc ) {

    Vue.component( 'layers-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'layers-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-layers.panel-layers-html' ],
        props: [ 'busy', 'layers', 'config' ],
        data: function () {
            return Object.assign( {}, this.config )
        },
        watch: {
            config: function ( val ) {
                Object.keys( val ).forEach( function ( k ) {
                    this[ k ] = val[ k ]
                } )
            }
        },
        methods: {
            getConfigState: function () {
                var self = this

                var state = {}
                Object.keys( this.config ).forEach( function ( k ) {
                    state[ k ] = self[ k ]
                } )
                return state
            },

            isAllVisible: function () {
                return this.layers.every( isLayerVisible ) || ( this.layers.some( isLayerVisible ) ? null : false )
            },

            isChildrenVisible: function ( layerId ) {
                var v = this.layers
                    .filter( function ( ly ) { return ly.parentId == layerId } )
                    .reduce( function ( accum, ly ) {
                        // console.log( accum,ly.id,ly.visible )
                        return accum === undefined ? ly.visible
                            : accum == null ? null
                            : ly.visible == accum ? accum
                            : null
                    }, undefined )
                // console.log( layerId, v )
                return v
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

    function isLayerVisible( ly ) { return ly.visible }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function LayersTool( option ) {
        this.makePropWidget( 'icon', 'layers' )
        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'layers', [] )
        this.makePropPanel( 'config', {
            legend: false,
            filter: null
        } )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          3,
            position:       'menu',
            title:          'Layers',
            widgetComponent:'layers-widget',
            panelComponent: 'layers-panel',
        }, option ) )
    }

    SMK.TYPE.LayersTool = LayersTool

    $.extend( LayersTool.prototype, SMK.TYPE.Tool.prototype )
    LayersTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayersTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.on( this.id, {
            'activate': function () {
                if ( !self.visible || !self.enabled ) return

                self.active = !self.active
            },

            'config': function ( ev ) {
                Object.assign( self.config, ev )

                if ( ev.legend ) {
                    smk.$viewer.layerIds.forEach( function ( id ) {
                        var ly = layerModel[ id ]
                        if ( ly.legends == null ) {
                            ly.legends = 'waiting'
                            smk.$viewer.layerId[ id ].getLegends( smk.$viewer )
                                .then( function ( ls ) {
                                    ly.legends = ls
                                }, function () {
                                    ly.legends = false
                                } )
                        }
                    } )
                }
            },

            'set-visible': function ( ev ) {
                smk.$viewer.setLayersVisible( ev.ids, ev.visible )
                smk.$viewer.layerIds.forEach( function ( id ) {
                    layerModel[ id ].visible = smk.$viewer.isLayerVisible( id )
                } )
            },

            // 'set-expanded': function ( ev ) {
            //     ev.ids.forEach( function ( id ) {
            //         var ly = layerModel[ id ]
            //         ly.expanded = ev.expanded

            //         if ( ly.expanded && ly.legends == null ) {
            //             ly.legends = 'waiting'
            //             smk.$viewer.layerId[ id ].getLegends()
            //                 .then( function ( ls ) {
            //                     ly.legends = ls
            //                 }, function () {
            //                     ly.legends = false
            //                 } )
            //         }
            //     } )
            // }
        } )

        // aux.widget.vm.$on( 'layers-widget.click', function () {
        //     if ( !self.visible || !self.enabled ) return

        //     self.active = !self.active
        // } )

        var layerModel = {}
        this.layers = smk.$viewer.layerIds.map( function ( id, i ) {
            var ly = smk.$viewer.layerId[ id ]

            return ( layerModel[ id ] = {
                id:             id,
                title:          ly.config.title,
                visible:        smk.$viewer.isLayerVisible( id ),
                expanded:       false,
                legends:        null,
                indent:         ly.parentId ? 1 : 0,
                parentId:       ly.parentId,
                isContainer:    ly.isContainer,
                hasLegend:      !ly.config.useHeatmap && !ly.isContainer,
                class:          ly.parentId && 'smk-sub-layer'
            } )
        } )

        smk.$viewer.startedLoading( function ( ev ) {
            self.busy = true
        } )

        smk.$viewer.finishedLoading( function ( ev ) {
            self.busy = false
        } )
    } )

    return LayersTool
} )
