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

        // smk.$viewer.handlePick( this, function ( location ) {
        //     smk.$viewer.identifyFeatures( location )
        // } )

        aux.widget.vm.$on( 'identify-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        aux.panel.vm.$on( 'identify-panel.add-all', function ( ev ) {
            self.layers.forEach( function ( ly ) {
                smk.$viewer.selected.add( ly.id, ly.features.map( function ( ft ) {
                    return smk.$viewer.identified.get( ft.id )
                } ) )
            } )
        } )

        smk.$viewer.startedIdentify( function ( ev ) {
            self.busy = true
            self.firstId = null
        } )

        smk.$viewer.finishedIdentify( function ( ev ) {
            self.busy = false

            if ( smk.$viewer.identified.isEmpty() )
                self.active = false
            else {
                smk.$viewer.changedView()
                smk.$viewer.identified.pick( self.firstId )
            }
        } )

        smk.$viewer.identified.addedFeatures( function ( ev ) {
            self.active = true

            var ly = smk.$viewer.layerId[ ev.layerId ]

            Vue.set( self.layers, ly.index, {
                id: ly.config.id,
                title: ly.config.title,
                features: ev.features.map( function ( ft ) {
                    if ( !self.firstId ) self.firstId = ft.id
                    return {
                        id: ft.id,
                        title: ft.title
                    }
                } )
            } )
        } )

    } )

    return IdentifyTool
} )
