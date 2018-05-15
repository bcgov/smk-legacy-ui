include.module( 'feature-list-leaflet', [ 'leaflet', 'feature-list' ], function ( inc ) {

    return function ( smk ) {
        var self = this

        self.featureListLayer = new E.layers.GraphicsLayer( { visible: false } )
        smk.$viewer.map.add( self.featureListLayer )
// 
        // this.highlight = {}
        // this.featureHighlights = L.layerGroup( { pane: 'markerPane' } )

        this.changedActive( function () {
            if ( self.active ) {
                if ( self.showPanel )
                    smk.$viewer.view.padding = { left: 340 }
                self.featureListLayer.visible = true
            }
            else {
                reset()
                smk.$viewer.view.padding = { left: 0 }
                self.featureListLayer.visible = false
            }
        } )

        this.showPopup = function ( loc ) {
            // self.popupModel.site = site

            smk.$viewer.showPopup( self.popupVm.$el, loc, { title: self.title } )
        }

        this.updatePopup = function () {
            smk.$viewer.showPopup( self.popupVm.$el, null, { title: self.title } )
        }
        
        // if ( this.showPanel ) {
            
        //     this.tlPadding = L.point( 340, 40 )
        //     this.brPadding = L.point( 40, 40 )
        // }
        // else {
        //     this.tlPadding = L.point( 40, 40 )
        //     this.brPadding = L.point( 40, 40 )
        // }

        // this.popup = L.popup( {
            //     maxWidth: 400,
            //     autoPanPaddingTopLeft: this.tlPadding,
            //     autoPanPaddingBottomRight: this.brPadding,
            //     offset: [ 0, -10 ]
            // } )
            // .setContent( function () { return self.popupVm.$el } )

        // this.updatePopup = SMK.UTIL.makeDelayedCall( function () {
        //     self.popup.update()
        // }, { delay: 500 } )

        // smk.$viewer.map.on( {
        //     popupclose: function ( ev ) {
        //         if ( ev.popup !== self.popup ) return

        //         self.featureSet.pick( null, { popupclose: true } )
        //     },
        // } )

        self.featureSet.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                showHighlight( ev.was.id, false )
            }

            if ( ev.feature ) {
                showHighlight( ev.feature.id, true )
            }
            else {
                // if ( self.popup.isOpen() && !ev.popupclose )
                    // self.popup.remove()
            }
        } )

        self.featureSet.highlightedFeatures( function ( ev ) {
            if ( ev.features )
                ev.features.forEach( function ( f ) {
                    showHighlight( f.id, true )
                } )

            if ( ev.was )
                ev.was.forEach( function ( f ) {
                    if ( f && f.id )
                        showHighlight( f.id, self.featureSet.isPicked( f.id ) )
                } )
        } )

        self.featureSet.clearedFeatures( function ( ev ) {
            self.featureListLayer.removeAll()
            // self.featureHighlights.clearLayers()
            // self.popup.remove()
            // self.highlight = {}
        } )

        self.featureSet.removedFeatures( function ( ev ) {
            ev.features.forEach( function ( ft ) {
                if ( self.featureSet.isPicked( ft.id ) )
                    self.featureSet.pick( null )

                self.featureHighlights.removeLayer( self.highlight[ ft.id ] )
                delete self.highlight[ ft.id ]
            } )
        } )

        self.featureSet.addedFeatures( function ( ev ) {
            ev.features.forEach( function ( f ) {
                var center
                switch ( turf.getType( f ) ) {
                case 'Point':
                    center = { latitude: f.geometry.coordinates[ 1 ], longitude: f.geometry.coordinates[ 0 ] }
                    break;

                case 'MultiPoint':
                    if ( f._identifyPoint )
                        center = f._identifyPoint //.latitude, f._identifyPoint.longitude ]
                    break;

                default:
                    if ( f._identifyPoint )
                        center = f._identifyPoint //.latitude, f._identifyPoint.longitude ]

                    self.highlight[ f.id ] = new E.Graphic( SMK.UTIL.geoJsonToEsriGeometry( f, 
                        SMK.UTIL.smkStyleToEsriSymbol( self.styleFeature()() ) 
                    ) )
                                    
                    // self.highlight[ f.id ] = L.geoJSON( f.geometry, {
                    //     style: self.styleFeature()
                    // } )
                }

                if ( !center ) {
                    var c = turf.centerOfMass( f.geometry ).geometry.coordinates
                    center = { latitude: c[ 1 ], longitude: c[ 0 ] }
                }

                self.marker[ f.id ] = new E.Graphic( {
                    geoemtry: Object.assign( { type: 'point' }, center ),
                    symbol: markerSymbol,
                    attributes: f.properties
                } )

                self.featureListLayer.add( self.marker[ f.id ] )
                // self.cluster.addLayer( self.marker[ f.id ] )
            } )
        } )

        self.featureSet.pickedFeature( function ( ev ) {
            if ( !ev.feature ) return

            var ly = self.marker[ ev.feature.id ]
            var parent = self.cluster.getVisibleParent( ly )

            if ( ly === parent || !parent ) {
                self.popupModel.hasMultiple = false
                self.popupFeatureIds = null
                self.popupCurrentIndex = null

                self.popup
                    .setLatLng( ly.getLatLng() )
                    .openOn( smk.$viewer.map )
            }
            else {
                var featureIds = parent.getAllChildMarkers().map( function ( m ) {
                    return m.options.featureId
                } )

                self.popupModel.hasMultiple = true
                self.popupCurrentIndex = featureIds.indexOf( ev.feature.id )
                self.popupModel.position = ( self.popupCurrentIndex + 1 ) + ' / ' + featureIds.length
                self.popupFeatureIds = featureIds

                self.popup
                    .setLatLng( parent.getLatLng() )
                    .openOn( smk.$viewer.map )
            }
        } )

        self.featureSet.zoomToFeature( function ( ev ) {
            var old = self.featureSet.pick( null )

            switch ( turf.getType( ev.feature ) ) {
            case 'Point':
                self.cluster.zoomToShowLayer( self.marker[ ev.feature.id ], function () {
                    if ( old )
                        self.featureSet.pick( old )
                } )
                break;

            default:
                if ( self.highlight[ ev.feature.id ] )
                    smk.$viewer.map
                        .once( 'zoomend moveend', function () {
                            if ( old )
                                self.featureSet.pick( old )
                        } )
                        .fitBounds( self.highlight[ ev.feature.id ].getBounds(), {
                            paddingTopLeft: self.tlPadding,
                            paddingBottomRight: self.brPadding,
                                        // paddingTopLeft: L.point( 300, 100 ),
                            animate: true
                        } )
            }
        } )
        
        function showHighlight( id, show ) {
            var hl = self.highlight[ id ]
            if ( !hl ) return

            if ( show ) {
                self.featureHighlights.addLayer( hl )
            }
            else {
                self.featureHighlights.removeLayer( hl )
            }
        }
    }

} )
