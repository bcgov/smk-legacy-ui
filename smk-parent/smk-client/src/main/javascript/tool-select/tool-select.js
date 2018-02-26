include.module( 'tool-select', [ 'smk', 'tool', 'widgets', 'tool-select.panel-select-html' ], function ( inc ) {

    Vue.component( 'select-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'select-panel', {
        template: inc[ 'tool-select.panel-select-html' ],
        props: [ 'tool' ],
        methods: {
            isEmpty: function () {
                return !this.tool.layers || this.tool.layers.length == 0
            }
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function SelectTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:      5,
            title:      'Selection',
            busy:       false,
            layers:     [],
            highlightId: null,
            widget: { icon: 'select_all', component: 'select-widget' },
            panel: { component: 'select-panel' },
        }, option ) )
    }

    SMK.TYPE.SelectTool = SelectTool

    $.extend( SelectTool.prototype, SMK.TYPE.Tool.prototype )

    SelectTool.prototype.getPanel = function () {
        var self = this
        return Object.assign( SMK.TYPE.Tool.prototype.getPanel(), {
            get layers() { return self.layers },
            get highlightId() { return self.highlightId },
            get busy() { return self.busy }
        } )
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SelectTool.prototype.afterInitialize = function ( smk, aux ) {
        var self = this

        aux.toolbar.vm.$on( 'select-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
            // console.log( arguments )
        } )

        // sb.vm.$on( 'identifyPanel.active', function ( ev ) {
        //     smk.$viewer.identified.pick( ev.feature.id )
        // } )

        // sb.vm.$on( 'identifyPanel.hover', function ( ev ) {
        //     smk.$viewer.identified.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
        // } )

        // sb.vm.$on( 'identifyPanel.add-all', function ( ev ) {
        // } )

        // sb.vm.$on( 'identifyPanel.clear', function ( ev ) {
        //     smk.$viewer.identified.clear()
        // } )

        // smk.$viewer.startedIdentify( function ( ev ) {
        //     model.busy = true
        // } )

        // smk.$viewer.finishedIdentify( function ( ev ) {
        //     model.busy = false
        // } )

        smk.$viewer.selected.addedFeatures( function ( ev ) {
            self.active = true

            // sb.vm.$emit( 'activate-tool', { active: true, id: 'select' } )

            var ly = smk.$viewer.layerId[ ev.layerId ]

            self.layers[ ly.index ] = {
                id: ly.config.id,
                title: ly.config.title,
                features: ev.features
            }
        } )

        // // smk.$viewer.selected.removedFeatures( function ( ev ) {
        // // } )

        // smk.$viewer.selected.pickedFeature( function ( ev ) {
        //     self.highlightId = ev.feature && ev.feature.id
        // } )

        // // smk.$viewer.selected.highlightedFeatures( function ( ev ) {
        // // } )

        smk.$viewer.selected.clearedFeatures( function ( ev ) {
            self.layers = []
        } )

    }

    return SelectTool
} )
