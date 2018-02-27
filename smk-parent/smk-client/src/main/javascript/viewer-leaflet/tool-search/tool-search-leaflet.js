include.module( 'tool-search-leaflet', [ 'leaflet', 'tool-search' ], function ( inc ) {

    var precisionSize = { // meters
        INTERSECTION:   100,
        STREET:         1000,
        BLOCK:          200,
        CIVIC_NUMBER:   50,
        _OTHER_:        10000
    }

    SMK.TYPE.SearchTool.prototype.afterInitialize.push( function ( smk ) {
        var vw = smk.$viewer

        vw.searchHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )

        vw.searched.addedFeatures( function ( ev ) {
            ev.features.forEach( function ( f ) {
                var l = L.marker( { lat: f.geometry.coordinates[ 1 ], lng: f.geometry.coordinates[ 0 ] }, {
                    title: f.properties.fullAddress,
                    riseOnHover: true,
                    opacity: 0.3,
                    // icon: L.icon( {

                    // } )
                } )

                vw.searchHighlights.addLayer( l )
                f.highlightLayer = l

                l.bindPopup( f.properties.fullAddress, {
                    maxWidth: 200,
                    autoPanPaddingTopLeft: L.point( 300, 100 )
                } )

                l.on( {
                    popupopen: function ( e ) {
                        vw.searched.pick( f.id )

                        var px = vw.map.project( e.popup._latlng )
                        px.y -= e.popup._container.clientHeight / 2
                        px.x -= 150
                        vw.map.panTo( vw.map.unproject( px ), { animate: true } )
                    },
                    popupclose: function () {
                        vw.searched.pick( null )
                    },
                } )

            } )
        } )

        vw.searched.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                var ly = ev.was.highlightLayer
                if ( ly.isPopupOpen() ) ly.closePopup()
                brightHighlight( ly, vw.searched.isHighlighted( ev.was.id ) )
            }

            if ( ev.feature ) {
                var ly = ev.feature.highlightLayer
                if ( !ly.isPopupOpen() ) ly.openPopup()
                brightHighlight( ev.feature.highlightLayer, true )

                // var ll = L.latLng( { lat: location[ 1 ], lng: location[ 0 ] } )
                var ex = ev.feature.highlightLayer.getLatLng().toBounds( precisionSize[ ev.feature.properties.matchPrecision ] || precisionSize._OTHER_ )
                vw.map.fitBounds( ex )
            }
        } )

        vw.searched.highlightedFeatures( function ( ev ) {
            if ( ev.features )
                ev.features.forEach( function ( f ) {
                    brightHighlight( f.highlightLayer, true )
                } )

            if ( ev.was )
                ev.was.forEach( function ( f ) {
                    brightHighlight( f.highlightLayer, vw.searched.isPicked( f.id ) )
                } )
        } )

        vw.searched.clearedFeatures( function ( ev ) {
            vw.searchHighlights.clearLayers()
        } )

        function brightHighlight( highlightLayer, bright ) {
            highlightLayer.setOpacity( bright ? 1 : 0.3 )
        }
    } )

    // return {
    //     order: 4,
    //     initialize: function ( smk, option ) {
    //         var vw = smk.$viewer

    //         vw.searchHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )

    //         vw.searched.addedFeatures( function ( ev ) {
    //             ev.features.forEach( function ( f ) {
    //                 var l = L.marker( { lat: f.geometry.coordinates[ 1 ], lng: f.geometry.coordinates[ 0 ] }, {
    //                     title: f.properties.fullAddress,
    //                     riseOnHover: true,
    //                     opacity: 0.3,
    //                     // icon: L.icon( {

    //                     // } )
    //                 } )

    //                 vw.searchHighlights.addLayer( l )
    //                 f.highlightLayer = l

    //                 l.bindPopup( f.properties.fullAddress, {
    //                     maxWidth: 200,
    //                     autoPanPaddingTopLeft: L.point( 300, 100 )
    //                 } )

    //                 l.on( {
    //                     popupopen: function ( e ) {
    //                         vw.searched.pick( f.id )

    //                         var px = vw.map.project( e.popup._latlng )
    //                         px.y -= e.popup._container.clientHeight / 2
    //                         px.x -= 150
    //                         vw.map.panTo( vw.map.unproject( px ), { animate: true } )
    //                     },
    //                     popupclose: function () {
    //                         vw.searched.pick( null )
    //                     },
    //                 } )

    //             } )
    //         } )

    //         vw.searched.pickedFeature( function ( ev ) {
    //             if ( ev.was ) {
    //                 var ly = ev.was.highlightLayer
    //                 if ( ly.isPopupOpen() ) ly.closePopup()
    //                 brightHighlight( ly, vw.searched.isHighlighted( ev.was.id ) )
    //             }

    //             if ( ev.feature ) {
    //                 var ly = ev.feature.highlightLayer
    //                 if ( !ly.isPopupOpen() ) ly.openPopup()
    //                 brightHighlight( ev.feature.highlightLayer, true )

    //                 // var ll = L.latLng( { lat: location[ 1 ], lng: location[ 0 ] } )
    //                 var ex = ev.feature.highlightLayer.getLatLng().toBounds( precisionSize[ ev.feature.properties.matchPrecision ] || 10000 )
    //                 vw.map.fitBounds( ex )
    //             }
    //         } )

    //         vw.searched.highlightedFeatures( function ( ev ) {
    //             if ( ev.features )
    //                 ev.features.forEach( function ( f ) {
    //                     brightHighlight( f.highlightLayer, true )
    //                 } )

    //             if ( ev.was )
    //                 ev.was.forEach( function ( f ) {
    //                     brightHighlight( f.highlightLayer, vw.searched.isPicked( f.id ) )
    //                 } )
    //         } )

    //         vw.searched.clearedFeatures( function ( ev ) {
    //             vw.searchHighlights.clearLayers()
    //         } )

    //         function brightHighlight( highlightLayer, bright ) {
    //             highlightLayer.setOpacity( bright ? 1 : 0.3 )
    //         }

    //         return inc[ 'tool-search' ].initialize( smk, option )
    //     }
    // }

} )
