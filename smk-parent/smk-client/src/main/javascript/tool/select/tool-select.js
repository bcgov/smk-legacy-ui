include.module( 'tool-select', [ 'smk', 'feature-list', 'widgets', 'tool-select.panel-select-html' ], function ( inc ) {

    Vue.component( 'select-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'select-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-select.panel-select-html' ],
        props: [ 'busy', 'layers', 'highlightId' ],
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

    } )

    return SelectTool
} )
