include.module( 'feature-list', [ 'smk', 'tool', 'widgets', 'feature-list.panel-feature-list-html', 'feature-list.popup-feature-html' ], function ( inc ) {

    // Vue.component( 'identify-widget', {
    //     extends: inc.widgets.toolButton,
    // } )

    Vue.component( 'feature-list-panel', {
        template: inc[ 'feature-list.panel-feature-list-html' ],
        props: [ 'busy', 'layers', 'highlightId' ],
        methods: {
            isEmpty: function () {
                return !this.layers || this.layers.length == 0
            }
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function FeatureList( option ) {
        // this.makePropWidget( 'icon', 'info_outline' )
        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'layers', [] )
        this.makePropPanel( 'highlightId', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            // order:          4,
            // title:          'Identify',
            // widgetComponent:'identify-widget',
            // panelComponent: 'identify-panel',
        }, option ) )
    }

    SMK.TYPE.FeatureList = FeatureList

    $.extend( FeatureList.prototype, SMK.TYPE.Tool.prototype )
    FeatureList.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    FeatureList.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        // smk.$viewer.handlePick( this, function ( location ) {
        //     smk.$viewer.identifyFeatures( location )
        // } )

        // aux.widget.vm.$on( 'identify-widget.click', function () {
        //     if ( !self.visible || !self.enabled ) return

        //     self.active = !self.active
        // } )

        aux.panel.vm.$on( this.panelComponent + '.active', function ( ev ) {
            smk.$viewer[ self.featureSetProperty ].pick( ev.feature.id )
        } )

        aux.panel.vm.$on( this.panelComponent + '.hover', function ( ev ) {
            smk.$viewer[ self.featureSetProperty ].highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
        } )

        // aux.panel.vm.$on( 'identify-panel.add-all', function ( ev ) {
        // } )

        aux.panel.vm.$on( this.panelComponent + '.clear', function ( ev ) {
            smk.$viewer[ self.featureSetProperty ].clear()
        } )

        // smk.$viewer.pickedLocation( function () {
        //     var enabledTools = Object.values( smk.$tool ).filter( function ( t ) { t.enabled } )


        // } )

        // smk.$viewer.startedIdentify( function ( ev ) {
            // self.busy = true
        // } )

        // smk.$viewer.finishedIdentify( function ( ev ) {
        //     self.busy = false

        //     if ( self.active && smk.$viewer.identified.isEmpty() )
        //         self.active = false
        // } )

        // smk.$viewer.identified.addedFeatures( function ( ev ) {
        //     self.active = true

        //     var ly = smk.$viewer.layerId[ ev.layerId ]

        //     self.layers[ ly.index ] = {
        //         id: ly.config.id,
        //         title: ly.config.title,
        //         features: ev.features
        //     }
        // } )

        // smk.$viewer.identified.removedFeatures( function ( ev ) {
        // } )

        smk.$viewer[ self.featureSetProperty ].pickedFeature( function ( ev ) {
            self.highlightId = ev.feature && ev.feature.id
        } )

        // smk.$viewer.identified.highlightedFeatures( function ( ev ) {
        // } )

        smk.$viewer[ self.featureSetProperty ].clearedFeatures( function ( ev ) {
            self.layers = []
        } )

        //  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =  =

        this.popupModel = {
            feature: null,
            layer: null
        }

        this.popupVm = new Vue( {
            el: smk.addToContainer( inc[ 'feature-list.popup-feature-html' ] ),
            data: this.popupModel,
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

        smk.$viewer[ self.featureSetProperty ].pickedFeature( function ( ev ) {
            if ( !ev.feature ) return

            self.popupModel.feature = ev.feature
            self.popupModel.layer = smk.$viewer.layerId[ ev.feature.layerId ]
        } )
    } )

    return FeatureList
} )
