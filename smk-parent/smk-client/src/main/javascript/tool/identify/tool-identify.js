include.module( 'tool-identify', [ 'smk', 'feature-list', 'widgets', 'tool-identify.panel-identify-html' ], function ( inc ) {

    Vue.component( 'identify-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'identify-panel', {
        template: inc[ 'tool-identify.panel-identify-html' ],
        props: [ 'busy', 'layers', 'highlightId' ],
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function IdentifyTool( option ) {
        this.makePropWidget( 'icon', 'info_outline' )

        SMK.TYPE.FeatureList.prototype.constructor.call( this, $.extend( {
            order:              4,
            title:              'Identify',
            widgetComponent:    'identify-widget',
            panelComponent:     'identify-panel',
            featureSetProperty: 'identified'
        }, option ) )
    }

    SMK.TYPE.IdentifyTool = IdentifyTool

    $.extend( IdentifyTool.prototype, SMK.TYPE.FeatureList.prototype )
    IdentifyTool.prototype.afterInitialize = SMK.TYPE.FeatureList.prototype.afterInitialize.concat( [] )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    IdentifyTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        smk.$viewer.handlePick( this, function ( location ) {
            smk.$viewer.identifyFeatures( location )
        } )

        aux.widget.vm.$on( 'identify-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        aux.panel.vm.$on( 'identify-panel.add-all', function ( ev ) {
        } )

        smk.$viewer.startedIdentify( function ( ev ) {
            self.busy = true
        } )

        smk.$viewer.finishedIdentify( function ( ev ) {
            self.busy = false

            if ( self.active && smk.$viewer.identified.isEmpty() )
                self.active = false
        } )

        smk.$viewer.identified.addedFeatures( function ( ev ) {
            self.active = true

            var ly = smk.$viewer.layerId[ ev.layerId ]

            Vue.set( self.layers, ly.index, {
                id: ly.config.id,
                title: ly.config.title,
                features: ev.features
            } )
        } )

    } )

    return IdentifyTool
} )
