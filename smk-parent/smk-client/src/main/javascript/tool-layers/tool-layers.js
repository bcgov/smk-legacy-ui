include.module( 'tool-layers', [ 'smk', 'tool', 'widgets', 'tool-layers.panel-layers-html' ], function ( inc ) {

    Vue.component( 'layers-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'layers-panel', {
        template: inc[ 'tool-layers.panel-layers-html' ],
        props: [ 'busy', 'layers' ],
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
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function LayersTool( option ) {
        this.makePropWidget( 'icon', 'layers' )
        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'layers', [] )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          3,
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
    LayersTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        aux.widget.vm.$on( 'layers-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        var layerModel = {}
        this.layers = smk.$viewer.layerIds.map( function ( id, i ) {
            var ly = smk.$viewer.layerId[ id ]

            return layerModel[ id ] = {
                id:             id,
                title:          ly.config.title,
                visible:        ly.config.isVisible,
                expanded:       false,
                legends:        null
            }
        } )

        aux.panel.vm.$on( 'layers-panel.set-visible', function ( ev ) {
            ev.ids.forEach( function ( id ) { layerModel[ id ].visible = ev.visible } )
            smk.$viewer.setLayersVisible( ev.ids, ev.visible )
        } )

        aux.panel.vm.$on( 'layers-panel.set-expanded', function ( ev ) {
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
            self.busy = true
        } )

        smk.$viewer.finishedLoading( function ( ev ) {
            self.busy = false
        } )
    } )

    return LayersTool
} )
