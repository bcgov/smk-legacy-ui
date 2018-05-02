include.module( 'tool-identify', [ 'feature-list', 'widgets', 'tool-identify.panel-identify-html' ], function ( inc ) {

    Vue.component( 'identify-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'identify-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-identify.panel-identify-html' ],
        props: [ 'busy', 'layers', 'highlightId', 'message', 'messageClass' ],
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
            showPanel:          false
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

        smk.$viewer.handlePick( this, function ( location ) {
            smk.$viewer.identifyFeatures( location )
        } )

        smk.on( this.id, {
            'activate': function () {
                if ( !self.visible || !self.enabled ) return

                self.active = !self.active
            },

            'add-all': function ( ev ) {
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
            self.setMessage( 'Fetching features', 'progress' )
        } )

        smk.$viewer.finishedIdentify( function ( ev ) {
            self.busy = false

            if ( smk.$viewer.identified.isEmpty() ) {
                self.active = false
                self.setMessage( 'No features found', 'warning' )
            }
            else {
                smk.$viewer.identified.pick( self.firstId )

                var stat = smk.$viewer.identified.getStats()

                var sub = SMK.UTIL.grammaticalNumber( stat.layerCount, null, null, 'on {} layers' )
                if ( stat.vertexCount > stat.featureCount )
                    sub += ( sub == '' ? '' : ', ' ) + SMK.UTIL.grammaticalNumber( stat.vertexCount, null, null, 'with {} vertices' )
                if ( sub != '' ) sub = '<div class="smk-submessage">' + sub + '</div>'

                self.setMessage( '<div>Identified ' + SMK.UTIL.grammaticalNumber( stat.featureCount, null, 'a feature', '{} features' ) + '</div>' + sub )
            }
        } )

    } )

    IdentifyTool.prototype.hasPickPriority = function ( toolIdSet ) {
        return !toolIdSet.location
    }

    return IdentifyTool
} )
