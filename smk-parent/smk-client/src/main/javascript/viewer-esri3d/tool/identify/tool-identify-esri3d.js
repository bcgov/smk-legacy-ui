include.module( 'tool-identify-esri3d', [ 'esri3d', 'tool-identify' ], function ( inc ) {

    SMK.TYPE.SearchTool.prototype.afterInitialize.push( function ( smk ) {
        var vw = smk.$viewer


        // vw.identifyHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )

        // vw.identified.addedFeatures( function ( ev ) {
        //     ev.features.forEach( function ( f ) {
        //         var l = L.geoJSON( f.geometry, {
        //             style: {
        //                 color:       '#ffff00',
        //                 weight:      2,
        //                 opacity:     0.7,
        //                 fillColor:   '#ffa500',
        //                 fillOpacity: 0.1,
        //             }
        //         } )

        //         vw.identifyHighlights.addLayer( l )
        //         f.highlightLayer = l

        //         l.bindPopup( vw.getIdentifyPopupEl, {
        //             maxWidth: 400,
        //             autoPanPaddingTopLeft: L.point( 300, 100 )
        //         } )

        //         l.on( {
        //             popupopen: function ( e ) {
        //                 vw.identified.pick( f.id )

        //                 var px = vw.map.project( e.popup._latlng )
        //                 px.y -= e.popup._container.clientHeight / 2
        //                 px.x -= 150
        //                 vw.map.panTo( vw.map.unproject( px ), { animate: true } )
        //             },
        //             popupclose: function () {
        //                 vw.identified.pick( null )
        //             },
        //         } )

        //     } )
        // } )

        // vw.identified.pickedFeature( function ( ev ) {
        //     if ( ev.was ) {
        //         var ly = ev.was.highlightLayer
        //         if ( ly.isPopupOpen() ) ly.closePopup()
        //         brightHighlight( ly, vw.identified.isHighlighted( ev.was.id ) )
        //     }

        //     if ( ev.feature ) {
        //         var ly = ev.feature.highlightLayer
        //         if ( !ly.isPopupOpen() ) ly.openPopup()
        //         brightHighlight( ev.feature.highlightLayer, true )
        //     }
        // } )

        // vw.identified.highlightedFeatures( function ( ev ) {
        //     if ( ev.features )
        //         ev.features.forEach( function ( f ) {
        //             brightHighlight( f.highlightLayer, true )
        //         } )

        //     if ( ev.was )
        //         ev.was.forEach( function ( f ) {
        //             brightHighlight( f.highlightLayer, vw.identified.isPicked( f.id ) )
        //         } )
        // } )

        // vw.identified.clearedFeatures( function ( ev ) {
        //     vw.identifyHighlights.clearLayers()
        // } )

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
