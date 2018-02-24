include.module( 'tool-identify', [ 'smk', 'tool', 'widgets', 'tool-identify.panel-identify-html', 'tool-identify.popup-identify-html' ], function ( inc ) {

    Vue.component( 'identify-widget', {
        extends: inc.widgets.toolButton,
        // template: inc[ 'tool-about.panel-identify-html' ],
        // props: [ 'title', 'about' ]
    } )

    Vue.component( 'identify-panel', {
        template: inc[ 'tool-identify.panel-identify-html' ],
        props: [ 'tool' ],
        methods: {
            isEmpty: function () {
                return !this.tool.layers || this.tool.layers.length == 0
            }
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function IdentifyTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:      4,
            title:      'Identify',
            budy:       false,
            layers:     [],
            highlightId: null,
            widget:     { icon: 'info_outline', component: 'identify-widget' },
            panel:      { component: 'identify-panel' },
            panelProperties: SMK.TYPE.Tool.prototype.panelProperties.concat( 'busy', 'layers', 'highlightId' )
        }, option ) )
    }

    SMK.TYPE.IdentifyTool = IdentifyTool

    $.extend( IdentifyTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    IdentifyTool.prototype.afterInitialize = function ( smk, aux ) {
        var self = this

        aux.toolbar.vm.$on( 'identify-widget.click', function () {
            if ( !self.isVisible() || !self.isEnabled() ) return

            self.active( !self.isActivated() )
            // console.log( arguments )
        } )

        // var model = sb.addPanel( 'identify', {
        //     button: { title: 'Identify', icon: 'info_outline' },
        //     panel: {
        //         busy: false,
        //         layers: [],
        //         highlightId: null
        //     }
        // } )

        aux.panel.vm.$on( 'identify-panel.active', function ( ev ) {
            smk.$viewer.identified.pick( ev.feature.id )
        } )

        aux.panel.vm.$on( 'identify-panel.hover', function ( ev ) {
            smk.$viewer.identified.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
        } )

        aux.panel.vm.$on( 'identify-panel.add-all', function ( ev ) {
        } )

        aux.panel.vm.$on( 'identify-panel.clear', function ( ev ) {
            smk.$viewer.identified.clear()
        } )

        smk.$viewer.startedIdentify( function ( ev ) {
            self.busy = true
        } )

        smk.$viewer.finishedIdentify( function ( ev ) {
            self.busy = false
        } )

        smk.$viewer.identified.addedFeatures( function ( ev ) {
            self.active( true )
            // sb.vm.$emit( 'activate-tool', { active: true, id: 'identify' } )

            var ly = smk.$viewer.layerId[ ev.layerId ]

            self.layers[ ly.index ] = {
                id: ly.config.id,
                title: ly.config.title,
                features: ev.features
            }
        } )

        // smk.$viewer.identified.removedFeatures( function ( ev ) {
        // } )

        smk.$viewer.identified.pickedFeature( function ( ev ) {
            self.highlightId = ev.feature && ev.feature.id
        } )

        // smk.$viewer.identified.highlightedFeatures( function ( ev ) {
        // } )

        smk.$viewer.identified.clearedFeatures( function ( ev ) {
            self.layers = []
        } )

        // Vue.component( 'identifyPanel', {
        //     template: inc[ 'tool-identify.panel-identify-html' ],
        //     props: [ 'layers', 'busy', 'highlightId' ],
        //     methods: {
        //         isEmpty: function () {
        //             return !this.layers || this.layers.length == 0
        //         }
        //     },
        // } )


        var el = smk.addToContainer( inc[ 'tool-identify.popup-identify-html' ] )

        var popupModel = {
            feature: null,
            layer: null
        }

        this.popupVm = new Vue( {
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

        smk.$viewer.getIdentifyPopupEl = function () { return self.popupVm.$el }


    }

    return IdentifyTool
} )

//     return {
//         order: 4,
//         initialize: function ( smk, option ) {
//             var sb = smk.getSidebar()

//             var model = sb.addPanel( 'identify', {
//                 button: { title: 'Identify', icon: 'info_outline' },
//                 panel: {
//                     busy: false,
//                     layers: [],
//                     highlightId: null
//                 }
//             } )

//             sb.vm.$on( 'identifyPanel.active', function ( ev ) {
//                 smk.$viewer.identified.pick( ev.feature.id )
//             } )

//             sb.vm.$on( 'identifyPanel.hover', function ( ev ) {
//                 smk.$viewer.identified.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
//             } )

//             sb.vm.$on( 'identifyPanel.add-all', function ( ev ) {
//             } )

//             sb.vm.$on( 'identifyPanel.clear', function ( ev ) {
//                 smk.$viewer.identified.clear()
//             } )

//             smk.$viewer.startedIdentify( function ( ev ) {
//                 model.busy = true
//             } )

//             smk.$viewer.finishedIdentify( function ( ev ) {
//                 model.busy = false
//             } )

//             smk.$viewer.identified.addedFeatures( function ( ev ) {
//                 sb.vm.$emit( 'activate-tool', { active: true, id: 'identify' } )

//                 var ly = smk.$viewer.layerId[ ev.layerId ]

//                 model.layers[ ly.index ] = {
//                     id: ly.config.id,
//                     title: ly.config.title,
//                     features: ev.features
//                 }
//             } )

//             // smk.$viewer.identified.removedFeatures( function ( ev ) {
//             // } )

//             smk.$viewer.identified.pickedFeature( function ( ev ) {
//                 model.highlightId = ev.feature && ev.feature.id
//             } )

//             // smk.$viewer.identified.highlightedFeatures( function ( ev ) {
//             // } )

//             smk.$viewer.identified.clearedFeatures( function ( ev ) {
//                 model.layers = []
//             } )

//             Vue.component( 'identifyPanel', {
//                 template: inc[ 'tool-identify.panel-identify-html' ],
//                 props: [ 'layers', 'busy', 'highlightId' ],
//                 methods: {
//                     isEmpty: function () {
//                         return !this.layers || this.layers.length == 0
//                     }
//                 },
//             } )


//             var el = smk.addToContainer( inc[ 'tool-identify.popup-identify-html' ] )

//             var popupModel = {
//                 feature: null,
//                 layer: null
//             }

//             var vm = new Vue( {
//                 el: el,
//                 data: popupModel,
//                 methods: {
//                     debug: function ( x ) {
//                         console.log( arguments )
//                         return x
//                     },
//                     zoomToFeature: function ( layer, feature ) {
//                         return smk.$viewer.zoomToFeature( layer, feature )
//                     },
//                     directionsToFeature: function ( layer, feature ) {
//                         return smk.$viewer.directionsToFeature( layer, feature )
//                     },
//                     selectFeature: function ( layer, feature ) {
//                         smk.$viewer.selected.add( layer.config.id, [ feature ] )
//                     }
//                 }
//             } )

//             smk.$viewer.identified.pickedFeature( function ( ev ) {
//                 if ( !ev.feature ) return

//                 popupModel.feature = ev.feature
//                 popupModel.layer = smk.$viewer.layerId[ ev.feature.layerId ]
//             } )

//             smk.$viewer.getIdentifyPopupEl = function () { return vm.$el }
//         }
//     }

// } )
