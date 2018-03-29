include.module( 'tool-search-leaflet', [ 'leaflet', 'tool-search' ], function ( inc ) {

    var precisionSize = { // meters
        INTERSECTION:   100,
        STREET:         1000,
        BLOCK:          200,
        CIVIC_NUMBER:   50,
        _OTHER_:        10000
    }

    var precisionZoom = {
        INTERSECTION:   15,
        STREET:         13,
        BLOCK:          14,
        CIVIC_NUMBER:   15,
        _OTHER_:        12
    }

    SMK.TYPE.SearchTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

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
                .bindPopup( function () {
                    return self.popupVm.$el
                }, {
                    maxWidth: 200,
                    autoPanPaddingTopLeft: L.point( 300, 100 )
                } )

                vw.searchHighlights.addLayer( l )
                f.highlightLayer = l

                l.on( {
                    popupopen: function ( e ) {
                        vw.searched.pick( f.id, { popupopen: true } )

                        var zoom = precisionZoom[ f.properties.matchPrecision ] || precisionZoom._OTHER_

                        var px = vw.map.project( e.popup._latlng, zoom )
                        px.y -= e.popup._container.clientHeight / 2
                        px.x -= 150

                        vw.map.flyTo( vw.map.unproject( px, zoom ), zoom, { animate: true } )
                    },
                    popupclose: function () {
                        vw.searched.pick( null, { popupclose: true } )
                    },
                } )

            } )
        } )

        vw.searched.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                var ly = ev.was.highlightLayer
                if ( ly.isPopupOpen() && !ev.popupclose ) ly.closePopup()
                brightHighlight( ly, vw.searched.isHighlighted( ev.was.id ) )
            }

            if ( ev.feature ) {
                var ly = ev.feature.highlightLayer
                if ( !ly.isPopupOpen() ) ly.openPopup()
                brightHighlight( ev.feature.highlightLayer, true )
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

} )
