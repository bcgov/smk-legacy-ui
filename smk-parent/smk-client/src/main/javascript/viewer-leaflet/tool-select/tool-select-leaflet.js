include.module( 'tool-select-leaflet', [ 'leaflet', 'tool-select' ], function ( inc ) {

    SMK.TYPE.SelectTool.prototype.afterInitialize.push( function ( smk ) {
        var vw = smk.$viewer

        vw.selectHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )

        vw.selected.addedFeatures( function ( ev ) {
            ev.features.forEach( function ( f ) {
                var l = L.geoJSON( f.geometry, {
                    style: {
                        color:       '#00ffff',
                        weight:      2,
                        opacity:     0.7,
                        fillColor:   '#00a5ff',
                        fillOpacity: 0.1,
                    }
                } )

                vw.selectHighlights.addLayer( l )
                f.selectLayer = l

                l.bindPopup( vw.getIdentifyPopupEl, {
                    maxWidth: 400,
                    autoPanPaddingTopLeft: L.point( 300, 100 )
                } )

                l.on( {
                    popupopen: function ( e ) {
                        vw.selected.pick( f.id )

                        var px = vw.map.project( e.popup._latlng )
                        px.y -= e.popup._container.clientHeight / 2
                        px.x -= 150
                        vw.map.panTo( vw.map.unproject( px ), { animate: true } )
                    },
                    popupclose: function () {
                        vw.selected.pick( null )
                    },
                } )

            } )
        } )

        vw.selected.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                var ly = ev.was.selectLayer
                if ( ly.isPopupOpen() ) ly.closePopup()
                brightHighlight( ly, vw.selected.isHighlighted( ev.was.id ) )
            }

            if ( ev.feature ) {
                var ly = ev.feature.selectLayer
                if ( !ly.isPopupOpen() ) ly.openPopup()
                brightHighlight( ev.feature.selectLayer, true )
            }
        } )

        vw.selected.highlightedFeatures( function ( ev ) {
            if ( ev.features )
                ev.features.forEach( function ( f ) {
                    brightHighlight( f.selectLayer, true )
                } )

            if ( ev.was )
                ev.was.forEach( function ( f ) {
                    brightHighlight( f.selectLayer, vw.selected.isPicked( f.id ) )
                } )
        } )

        vw.selected.clearedFeatures( function ( ev ) {
            vw.selectHighlights.clearLayers()
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
