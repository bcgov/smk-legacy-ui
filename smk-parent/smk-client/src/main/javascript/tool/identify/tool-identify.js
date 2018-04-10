include.module( 'tool-identify', [ 'smk', 'feature-list', 'widgets', 'tool-identify.panel-identify-html' ], function ( inc ) {

    Vue.component( 'identify-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'identify-panel', {
        extends: inc.widgets.toolPanel,
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
            // featureSetProperty: 'identified'
        }, option ) )
    }

    SMK.TYPE.IdentifyTool = IdentifyTool

    $.extend( IdentifyTool.prototype, SMK.TYPE.FeatureList.prototype )
    IdentifyTool.prototype.afterInitialize = SMK.TYPE.FeatureList.prototype.afterInitialize.concat( [] )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    IdentifyTool.prototype.afterInitialize.unshift( function ( smk ) {
        this.featureSet = smk.$viewer.identified
    } )

    IdentifyTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        // smk.$viewer.handlePick( this, function ( location ) {
        //     smk.$viewer.identifyFeatures( location )
        // } )

        smk.on( this.id, {
            'activate': function () {
                if ( !self.visible || !self.enabled ) return

                self.active = !self.active
            },

            'add-all': function ( ev ) {
                console.log(ev);

                self.layers.forEach( function ( ly ) {
                    smk.$viewer.selected.add( ly.id, ly.features.map( function ( ft ) {
                        return smk.$viewer.identified.get( ft.id )
                    } ) )
                } )
            }
        } )

        smk.$viewer.startedIdentify( function ( ev ) {
            self.busy = true
            self.firstId = null
            self.active = true
        } )

        smk.$viewer.finishedIdentify( function ( ev ) {
            self.busy = false

            if ( smk.$viewer.identified.isEmpty() )
                self.active = false
            else {
                smk.$tool.location.reset()
                smk.$viewer.identified.pick( self.firstId )
            }
        } )

    } )

    return IdentifyTool
} )
