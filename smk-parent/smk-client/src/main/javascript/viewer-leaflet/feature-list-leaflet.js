include.module( 'feature-list-leaflet', [ 'leaflet', 'feature-list' ], function ( inc ) {

    SMK.TYPE.FeatureList.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        var vw = smk.$viewer
        var featureSet = smk.$viewer[ self.featureSetProperty ]

        this.featureHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )

        featureSet.addedFeatures( function ( ev ) {
            ev.features.forEach( function ( f ) {
                var feature = L.geoJSON( f.geometry, {
                    pointToLayer: function ( geojson, latlng ) {
                        return L.circleMarker( latlng, { radius: 20 } )
                    },
                    style: self.styleFeature
                } )
                .bindPopup( function () {
                    return self.popupVm.$el
                }, {
                    maxWidth: 400,
                    autoPanPaddingTopLeft: L.point( 300, 100 )
                } )

                self.featureHighlights.addLayer( feature )
                f.highlightLayer = feature

                feature.on( {
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

            } )
        } )

        featureSet.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                var ly = ev.was.highlightLayer
                if ( ly.isPopupOpen() && !ev.popupclose ) ly.closePopup()
                brightHighlight( ly, featureSet.isHighlighted( ev.was.id ) )
            }

            if ( ev.feature ) {
                var ly = ev.feature.highlightLayer
                if ( !ly.isPopupOpen() ) ly.openPopup()
                brightHighlight( ev.feature.highlightLayer, true )
            }
        } )

        featureSet.highlightedFeatures( function ( ev ) {
            if ( ev.features )
                ev.features.forEach( function ( f ) {
                    brightHighlight( f.highlightLayer, true )
                } )

            if ( ev.was )
                ev.was.forEach( function ( f ) {
                    brightHighlight( f.highlightLayer, featureSet.isPicked( f.id ) )
                } )
        } )

        featureSet.clearedFeatures( function ( ev ) {
            self.featureHighlights.clearLayers()
        } )

        function brightHighlight( highlightLayer, bright ) {
            if ( bright )
                highlightLayer.setStyle( {
                    opacity:     0.8,
                    weight:      4,
                    fillOpacity: 0.5,
                } )
            else
                highlightLayer.eachLayer( function ( ly ) {
                    highlightLayer.resetStyle( ly )
                } )
        }
    } )

} )
