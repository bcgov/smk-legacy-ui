include.module( 'feature-list-leaflet', [ 'leaflet', 'feature-list' ], function ( inc ) {

    SMK.TYPE.FeatureList.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        var vw = smk.$viewer
        var featureSet = smk.$viewer[ self.featureSetProperty ]

        this.popup = L.popup( {
                maxWidth: 400,
                autoPanPaddingTopLeft: L.point( 300, 100 ),
                offset: [ 0, -10 ]
            } )
            .setContent( function () { return self.popupVm.$el } )

        vw.map.on( {
            popupopen: function ( ev ) {
                if ( ev.popup !== self.popup ) return

                var px = vw.map.project( ev.popup._latlng )
                px.y -= ev.popup._container.clientHeight / 2
                px.x -= 150
                vw.map.panTo( vw.map.unproject( px ), { animate: true } )
            },

            popupclose: function ( ev ) {
                if ( ev.popup !== self.popup ) return

                featureSet.pick( null, { popupclose: true } )
            },
        } )

        this.highlight = {}
        this.featureHighlights = L.layerGroup( { pane: 'markerPane' } ).addTo( vw.map )

        featureSet.pickedFeature( function ( ev ) {
            if ( ev.was ) {
                showHighlight( ev.was.id, false )
            }

            if ( ev.feature ) {
                showHighlight( ev.feature.id, true )
            }
            else {
                if ( self.popup.isOpen() && !ev.popupclose )
                    self.popup.remove()
            }
        } )

        featureSet.highlightedFeatures( function ( ev ) {
            if ( ev.features )
                ev.features.forEach( function ( f ) {
                    showHighlight( f.id, true )
                } )

            if ( ev.was )
                ev.was.forEach( function ( f ) {
                    showHighlight( f.id, featureSet.isPicked( f.id ) )
                } )
        } )

        featureSet.clearedFeatures( function ( ev ) {
            self.featureHighlights.clearLayers()
            self.popup.remove()
            self.highlight = {}
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
    } )

} )
