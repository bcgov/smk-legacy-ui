include.module( 'feature-list-leaflet', [ 'leaflet', 'feature-list' ], function ( inc ) {

    SMK.TYPE.FeatureList.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        var vw = smk.$viewer
        var featureSet = smk.$viewer[ self.featureSetProperty ]

        this.featureHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )
        this.highlight = {}
        this.marker = {}
        this.markers = L.markerClusterGroup( {
                singleMarkerMode: true
            } )
            .addTo( vw.map )

        featureSet.addedFeatures( function ( ev ) {
            ev.features.forEach( function ( f ) {
                var center = turf.centroid( f.geometry )

                if ( center.geometry )
                    center = center.geometry

                self.marker[ f.id ] = L.marker( [ center.coordinates[ 1 ], center.coordinates[ 0 ] ] )
                    .bindPopup( function () {
                        return self.popupVm.$el
                    }, {
                        maxWidth: 400,
                        autoPanPaddingTopLeft: L.point( 300, 100 )
                    } )
                    .on( {
                        popupopen: function ( e ) {
                            featureSet.pick( f.id, { popupopen: true } )

                            var px = vw.map.project( e.popup._latlng )
                            px.y -= e.popup._container.clientHeight / 2
                            px.x -= 150
                            vw.map.panTo( vw.map.unproject( px ), { animate: true } )
                        },
                        popupclose: function () {
                            featureSet.pick( null, { popupclose: true } )
                        },
                    } )

                // self.featureHighlights.addLayer( feature )
                self.markers.addLayer( self.marker[ f.id ] )

                switch ( turf.getType( f ) ) {
                case 'Point':
                case 'MultiPoint':
                    break;

                default:
                    self.highlight[ f.id ] = L.geoJSON( f.geometry, {
                        // pointToLayer: function ( geojson, latlng ) {
                        //     return L.circleMarker( latlng, { radius: 20 } )
                        // },
                        style: self.styleFeature
                    } )
                }

            } )
        } )

        featureSet.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                var ly = self.marker[ ev.was.id ]
                if ( ly.isPopupOpen() && !ev.popupclose ) ly.closePopup()

                showHighlight( ev.was.id, false )
                // brightHighlight( ly, featureSet.isHighlighted( ev.was.id ) )
            }

            if ( ev.feature ) {
                var ly = self.marker[ ev.feature.id ]

                if ( !ly.isPopupOpen() ) {
                    vw.map.setZoom( 1, { animate: false } )
                    self.markers.zoomToShowLayer( ly, function () {
                        ly.openPopup()
                    } )
                }

                showHighlight( ev.feature.id, true )
                // brightHighlight( ly, true )
            }
        } )

        featureSet.highlightedFeatures( function ( ev ) {
            if ( ev.features )
                ev.features.forEach( function ( f ) {
                    showHighlight( f.id, true )
                    // brightHighlight( self.highlight[ f.id ], true )
                } )

            if ( ev.was )
                ev.was.forEach( function ( f ) {
                    showHighlight( f.id, featureSet.isPicked( f.id ) )
                    // brightHighlight( self.highlight[ f.id ], featureSet.isPicked( f.id ) )
                } )
        } )

        featureSet.clearedFeatures( function ( ev ) {
            self.featureHighlights.clearLayers()
            self.markers.clearLayers()
            self.highlight = {}
            self.marker = {}
        } )

        featureSet.removedFeatures( function ( ev ) {
            ev.features.forEach( function ( ft ) {
                self.featureHighlights.removeLayer( self.highlight[ ft.id ] )
            } )
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

        // function brightHighlight( highlightLayer, bright ) {
        //     if ( bright )
        //         highlightLayer.setStyle( {
        //             opacity:     0.8,
        //             weight:      4,
        //             fillOpacity: 0.5,
        //         } )
        //     else
        //         highlightLayer.eachLayer( function ( ly ) {
        //             highlightLayer.resetStyle( ly )
        //         } )
        // }
    } )

} )
