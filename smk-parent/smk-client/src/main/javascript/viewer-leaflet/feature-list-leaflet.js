include.module( 'feature-list-leaflet', [ 'leaflet', 'feature-list' ], function ( inc ) {

    SMK.TYPE.FeatureList.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        var vw = smk.$viewer
        // var self.featureSet = smk.$viewer[ self.featureSetProperty ]

        this.highlight = {}
        this.featureHighlights = L.layerGroup( { pane: 'markerPane' } )

        if ( this.showPanel ) {
            this.tlPadding = L.point( 340, 40 )
            this.brPadding = L.point( 40, 40 )
        }
        else {
            this.tlPadding = L.point( 40, 40 )
            this.brPadding = L.point( 40, 40 )
        }

        this.popup = L.popup( {
                maxWidth: 400,
                autoPanPaddingTopLeft: this.tlPadding,
                autoPanPaddingBottomRight: this.brPadding,
                offset: [ 0, -10 ]
            } )
            .setContent( function () { return self.popupVm.$el } )

        vw.map.on( {
            popupopen: function ( ev ) {
                if ( ev.popup !== self.popup ) return

                // var px = vw.map.project( ev.popup._latlng )
                // px.y -= ev.popup._container.clientHeight / 2
                // px.x -= 150
                // vw.map.panTo( vw.map.unproject( px ), { animate: true } )
            },

            popupclose: function ( ev ) {
                if ( ev.popup !== self.popup ) return

                self.featureSet.pick( null, { popupclose: true } )
            },
        } )

        self.changedActive( function () {
            if ( self.active ) {
                self.featureHighlights.addTo( vw.map )
            }
            else {
                vw.map.removeLayer( self.featureHighlights )
                self.popup.remove()
            }
        } )

        self.featureSet.pickedFeature( function ( ev ) {
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
            self.featureHighlights.clearLayers()
            self.popup.remove()
            self.highlight = {}
        } )

        self.featureSet.removedFeatures( function ( ev ) {
            ev.features.forEach( function ( ft ) {
                if ( self.featureSet.isPicked( ft.id ) )
                    self.featureSet.pick( null )

                self.featureHighlights.removeLayer( self.highlight[ ft.id ] )
                delete self.highlight[ ft.id ]
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

    SMK.TYPE.FeatureList.prototype.updatePopup = SMK.UTIL.makeDelayedCall( function () {
        this.popup.update()
    }, { delay: 500 } )

} )
