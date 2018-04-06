include.module( 'tool-select', [ 'smk', 'feature-list', 'widgets', 'tool-select.panel-select-html' ], function ( inc ) {

    Vue.component( 'select-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'select-panel', {
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
            panelComponent:     'select-panel',
            featureSetProperty: 'selected'
        }, option ) )
    }

    SMK.TYPE.SelectTool = SelectTool

    $.extend( SelectTool.prototype, SMK.TYPE.FeatureList.prototype )
    SelectTool.prototype.afterInitialize = SMK.TYPE.FeatureList.prototype.afterInitialize.concat( [] )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SelectTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        aux.widget.vm.$on( 'select-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        smk.$viewer.selected.addedFeatures( function ( ev ) {
            self.active = true

            var ly = smk.$viewer.layerId[ ev.layerId ]

            if ( !self.layers[ ly.index ] )
                Vue.set( self.layers, ly.index, {
                    id:         ly.config.id,
                    title:      ly.config.title,
                    features: ev.features.map( function ( ft ) {
                        return {
                            id:     ft.id,
                            title:  ft.title
                        }
                    } )
                } )
            else
                Vue.set( self.layers[ ly.index ], 'features', self.layers[ ly.index ].features.concat( ev.features.map( function ( ft ) {
                    return {
                        id:     ft.id,
                        title:  ft.title
                    }
                } ) ) )
        } )

    } )

    return SelectTool
} )
