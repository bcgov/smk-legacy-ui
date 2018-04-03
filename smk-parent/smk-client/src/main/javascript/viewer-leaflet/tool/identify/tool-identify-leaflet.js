include.module( 'tool-identify-leaflet', [ 'leaflet', 'tool-identify' ], function ( inc ) {

    SMK.TYPE.IdentifyTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        var vw = smk.$viewer

        this.featureHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )

        vw.identified.addedFeatures( function ( ev ) {
            ev.features.forEach( function ( f ) {
                var feature = L.geoJSON( f.geometry, {
                    pointToLayer: function ( geojson, latlng ) {
                        return L.circleMarker( latlng, { radius: 20 } )
                    },
                    style: {
                        color:       '#ffff00',
                        weight:      2,
                        opacity:     0.7,
                        fillColor:   '#ffa500',
                        fillOpacity: 0.1,
                    }
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
                        vw.identified.pick( f.id, { popupopen: true } )

                        var px = vw.map.project( e.popup._latlng )
                        px.y -= e.popup._container.clientHeight / 2
                        px.x -= 150
                        vw.map.panTo( vw.map.unproject( px ), { animate: true } )
                    },
                    popupclose: function () {
                        vw.identified.pick( null, { popupclose: true } )
                    },
                } )

            } )
        } )

        vw.identified.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                var ly = ev.was.highlightLayer
                if ( ly.isPopupOpen() && !ev.popupclose ) ly.closePopup()
                brightHighlight( ly, vw.identified.isHighlighted( ev.was.id ) )
            }

            if ( ev.feature ) {
                var ly = ev.feature.highlightLayer
                if ( !ly.isPopupOpen() ) ly.openPopup()
                brightHighlight( ev.feature.highlightLayer, true )
            }
        } )

        vw.identified.highlightedFeatures( function ( ev ) {
            if ( ev.features )
                ev.features.forEach( function ( f ) {
                    brightHighlight( f.highlightLayer, true )
                } )

            if ( ev.was )
                ev.was.forEach( function ( f ) {
                    brightHighlight( f.highlightLayer, vw.identified.isPicked( f.id ) )
                } )
        } )

        vw.identified.clearedFeatures( function ( ev ) {
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
