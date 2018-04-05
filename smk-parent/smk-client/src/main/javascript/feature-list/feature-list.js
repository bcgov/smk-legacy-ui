include.module( 'feature-list', [ 'smk', 'tool', 'widgets', 'feature-list.panel-feature-list-html', 'feature-list.popup-feature-html' ], function ( inc ) {

    Vue.component( 'feature-list-panel', {
        template: inc[ 'feature-list.panel-feature-list-html' ],
        props: [ 'busy', 'layers', 'highlightId', 'canRemove' ],
        computed: {
            isEmpty: {
                get: function () {
                    return !this.layers || this.layers.length == 0 || this.layers.every( function ( ly ) { return ly.features.length == 0 } )
                }
            }
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function FeatureList( option ) {
        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'layers', [] )
        this.makePropPanel( 'highlightId', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
        }, option ) )
    }

    SMK.TYPE.FeatureList = FeatureList

    $.extend( FeatureList.prototype, SMK.TYPE.Tool.prototype )
    FeatureList.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    FeatureList.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        aux.panel.vm.$on( this.panelComponent + '.active', function ( ev ) {
            smk.$viewer[ self.featureSetProperty ].pick( ev.featureId )
        } )

        aux.panel.vm.$on( this.panelComponent + '.hover', function ( ev ) {
            smk.$viewer[ self.featureSetProperty ].highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
        } )

        aux.panel.vm.$on( this.panelComponent + '.clear', function ( ev ) {
            smk.$viewer[ self.featureSetProperty ].clear()
        } )

        aux.panel.vm.$on( this.panelComponent + '.remove', function ( ev ) {
            smk.$viewer[ self.featureSetProperty ].remove( [ ev.featureId ] )
        } )

        // = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : =

        smk.$viewer[ self.featureSetProperty ].clearedFeatures( function ( ev ) {
            self.layers = []
        } )

        smk.$viewer[ self.featureSetProperty ].removedFeatures( function ( ev ) {
            var ly = smk.$viewer.layerId[ ev.features[ 0 ].layerId ]

            self.layers[ ly.index ].features = self.layers[ ly.index ].features.filter( function ( ft ) {
                return ft.id != ev.features[ 0 ].id
            } )
        } )

        smk.$viewer[ self.featureSetProperty ].pickedFeature( function ( ev ) {
            if ( !ev.feature ) {
                self.highlightId = null
                self.popupModel.layer = null
                self.popupModel.feature = null
                return
            }

            self.highlightId = ev.feature.id

            var ly = smk.$viewer.layerId[ ev.feature.layerId ]
            self.popupModel.layer = {
                id:         ev.feature.layerId,
                title:      ly.config.title,
                attributes: ly.config.attributes.map( function ( at ) {
                    return {
                        visible:at.visible,
                        title:  at.title,
                        name:   at.name
                    }
                } )
            }

            self.popupModel.feature = {
                id:         ev.feature.id,
                title:      ev.feature.title,
                properties: Object.assign( {}, ev.feature.properties )
            }
        } )

        // = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : =

        this.popupModel = {
            feature: null,
            layer: null,
            tool: {}
        }

        if ( smk.$tool.select && this.type != 'select' )
            this.popupModel.tool.select = true

        if ( smk.$tool.zoom )
            this.popupModel.tool.zoom = true

        this.popupVm = new Vue( {
            el: smk.addToContainer( inc[ 'feature-list.popup-feature-html' ] ),
            data: this.popupModel,
            methods: {
                // debug: function ( x ) {
                //     console.log( arguments )
                //     return x
                // },
                zoomToFeature: function ( layerId, featureId ) {
                    return smk.$viewer.zoomToFeature( layerId, smk.$viewer[ self.featureSetProperty ].get( featureId ) )
                },
                selectFeature: function ( layerId, featureId ) {
                    smk.$viewer.selected.add( layerId, [ smk.$viewer[ self.featureSetProperty ].get( featureId ) ] )
                }
            }
        } )

    } )

    return FeatureList
} )
