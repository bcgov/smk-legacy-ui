include.module( 'tool-select', [ 'feature-list', 'widgets', 'tool-select.panel-select-html' ], function ( inc ) {

    Vue.component( 'select-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'select-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-select.panel-select-html' ],
        props: [ 'busy', 'layers', 'highlightId', 'message', 'messageClass' ],
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function SelectTool( option ) {
        this.makePropWidget( 'icon', 'select_all' )

        SMK.TYPE.FeatureList.prototype.constructor.call( this, $.extend( {
            order:              5,
            position:           'menu',
            title:              'Selection',
            widgetComponent:    'select-widget',
            panelComponent:     'select-panel'
        }, option ) )
    }

    SMK.TYPE.SelectTool = SelectTool

    $.extend( SelectTool.prototype, SMK.TYPE.FeatureList.prototype )
    SelectTool.prototype.afterInitialize = SMK.TYPE.FeatureList.prototype.afterInitialize.concat( [] )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SelectTool.prototype.afterInitialize.unshift( function ( smk ) {
        this.featureSet = smk.$viewer.selected
    } )

    SelectTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.on( this.id, {
            'activate': function () {
                if ( !self.visible || !self.enabled ) return

                self.active = !self.active
            }
        } )

        self.featureSet
            .addedFeatures( updateMessage )
            .removedFeatures( updateMessage )

        function updateMessage() {
            var stat = smk.$viewer.identified.getStats()

            var sub = ''
            if ( stat.vertexCount > stat.featureCount )
                sub = '<div class="smk-submessage">' + SMK.UTIL.grammaticalNumber( stat.vertexCount, null, null, 'with {} vertices' ) + '</div>'

            self.setMessage( '<div>Selection contains ' + SMK.UTIL.grammaticalNumber( stat.featureCount, null, 'a feature', '{} features' ) + '</div>' + sub )
        }
    } )

    return SelectTool
} )
