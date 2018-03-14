include.module( 'tool-directions', [ 'smk', 'tool', 'widgets', 'tool-directions.panel-directions-html', 'tool-directions.popup-directions-html' ], function ( inc ) {

    Vue.component( 'directions-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'directions-panel', {
        template: inc[ 'tool-directions.panel-directions-html' ],
        props: [ 'busy', 'layers', 'highlightId' ],
        methods: {
            isEmpty: function () {
                return !this.layers || this.layers.length == 0
            }
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function DirectionsTool( option ) {
        this.makePropWidget( 'icon', 'info_outline' )
        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'layers', [] )
        this.makePropPanel( 'highlightId', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          4,
            title:          'Identify',
            widgetComponent:'directions-widget',
            panelComponent: 'directions-panel',
        }, option ) )
    }

    SMK.TYPE.DirectionsTool = DirectionsTool

    $.extend( DirectionsTool.prototype, SMK.TYPE.Tool.prototype )
    DirectionsTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    DirectionsTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        aux.widget.vm.$on( 'directions-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        aux.panel.vm.$on( 'directions-panel.active', function ( ev ) {
            smk.$viewer.identified.pick( ev.feature.id )
        } )

        aux.panel.vm.$on( 'directions-panel.hover', function ( ev ) {
            smk.$viewer.identified.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
        } )

        aux.panel.vm.$on( 'directions-panel.add-all', function ( ev ) {
        } )

        aux.panel.vm.$on( 'directions-panel.clear', function ( ev ) {
            smk.$viewer.identified.clear()
        } )

        smk.$viewer.startedIdentify( function ( ev ) {
            self.busy = true
        } )

        smk.$viewer.finishedIdentify( function ( ev ) {
            self.busy = false
        } )

        smk.$viewer.identified.addedFeatures( function ( ev ) {
            self.active = true
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

        var el = smk.addToContainer( inc[ 'tool-directions.popup-directions-html' ] )

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
    } )

    return DirectionsTool
} )
