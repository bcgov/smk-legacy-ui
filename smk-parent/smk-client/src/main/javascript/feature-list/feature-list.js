include.module( 'feature-list', [ 'smk', 'tool', 'widgets', 'feature-list.panel-feature-list-html', 'feature-list.popup-feature-html' ], function ( inc ) {

    Vue.component( 'feature-list-panel', {
        extends: inc.widgets.toolPanel,
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
    FeatureList.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.on( this.id, {
            'active': function ( ev ) {
                self.featureSet.pick( ev.featureId )
            },

            'hover': function ( ev ) {
                self.featureSet.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
            },

            'clear': function ( ev ) {
                self.featureSet.clear()
            },

            'remove': function ( ev ) {
                self.featureSet.remove( [ ev.featureId ] )
            }
        } )

        // = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : = : =

        self.featureSet.addedFeatures( function ( ev ) {
            self.active = true

            var ly = smk.$viewer.layerId[ ev.layerId ]

            if ( !self.layers[ ly.index ] )
                Vue.set( self.layers, ly.index, {
                    id:         ly.config.id,
                    title:      ly.config.title,
                    features:   []
                } )

            Vue.set( self.layers[ ly.index ], 'features', self.layers[ ly.index ].features.concat( ev.features.map( function ( ft ) {
                return {
                    id:     ft.id,
                    title:  ft.title
                }
            } ) ) )
        } )

        self.featureSet.clearedFeatures( function ( ev ) {
            self.layers = []
        } )

        self.featureSet.removedFeatures( function ( ev ) {
            var ly = smk.$viewer.layerId[ ev.features[ 0 ].layerId ]

            self.layers[ ly.index ].features = self.layers[ ly.index ].features.filter( function ( ft ) {
                return ft.id != ev.features[ 0 ].id
            } )
        } )

        self.featureSet.pickedFeature( function ( ev ) {
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
            tool: {},
            hasMultiple: false,
            position: null
        }

        this.popupFeatureIds = null
        this.popupCurrentIndex = null

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
                    return self.featureSet.zoomTo( featureId )
                },

                selectFeature: function ( layerId, featureId ) {
                    smk.$viewer.selected.add( layerId, [ self.featureSet.get( featureId ) ] )
                },

                movePrevious: function () {
                    var l = self.popupFeatureIds.length
                    self.popupCurrentIndex = ( self.popupCurrentIndex + l - 1 ) % l
                    this.position = ( self.popupCurrentIndex + 1 ) + ' / ' + l
                    self.featureSet.pick( self.popupFeatureIds[ self.popupCurrentIndex ] )
                },

                moveNext: function () {
                    var l = self.popupFeatureIds.length
                    self.popupCurrentIndex = ( self.popupCurrentIndex + 1 ) % l
                    this.position = ( self.popupCurrentIndex + 1 ) + ' / ' + l
                    self.featureSet.pick( self.popupFeatureIds[ self.popupCurrentIndex ] )
                },
            }
        } )

    } )

    return FeatureList
} )
