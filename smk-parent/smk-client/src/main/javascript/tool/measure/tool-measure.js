include.module( 'tool-measure', [ 'tool', 'widgets', 'tool-measure.panel-measure-html' ], function ( inc ) {

    Vue.component( 'measure-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'measure-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-measure.panel-measure-html' ],
        props: [ 'busy', 'layers', 'config' ],
    } )

    // leaflet specific
    Vue.directive( 'container', {
        unbind: function ( el, binding, vnode ) {

            // console.log( 'unbind', arguments )
            vnode.context.$$emit( 'container-unbind', { el: el } )
        },

        inserted: function ( el, binding, vnode ) {
            vnode.context.$$emit( 'container-inserted', { el: el } )
            // console.log( 'inserted', arguments )
        },

        update: function ( el, binding ) {
            console.log( 'update', arguments )
        }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function MeasureTool( option ) {
        this.makePropWidget( 'icon', 'straighten' )
        this.makePropPanel( 'busy', false )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          2,
            position:       'toolbar',
            title:          'Measurement',
            widgetComponent:'measure-widget',
            panelComponent: 'measure-panel',
        }, option ) )
    }

    SMK.TYPE.MeasureTool = MeasureTool

    $.extend( MeasureTool.prototype, SMK.TYPE.Tool.prototype )
    MeasureTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    MeasureTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.on( this.id, {
            'activate': function () {
                if ( !self.visible || !self.enabled ) return

                self.active = !self.active
            },

            'container-inserted': function ( ev ) {
                console.log( ev )

            },

            'container-unbind': function ( ev ) {
                console.log( ev )

            }
        } )
    } )

    return MeasureTool
} )

