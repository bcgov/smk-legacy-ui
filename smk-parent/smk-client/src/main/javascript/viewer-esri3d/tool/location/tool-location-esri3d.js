include.module( 'tool-location-esri3d', [ 'esri3d', 'types-esri3d', 'tool-location' ], function ( inc ) {

    var E = SMK.TYPE.Esri3d

    var base = include.option( 'baseUrl' ) + '/tool/directions'

    var blueSymbol = {
        type: 'point-3d',
        symbolLayers: [
            {
                type:       'icon',
                size:       '41px',
                anchor:     'bottom',
                resource: {
                    href:   base + '/marker-shadow.png',
                }
            },
            {
                type:       'icon',
                size:       '41px',
                anchor:     'bottom',
                resource: {
                    href:   base + '/marker-icon-red.png',
                }
            }
        ]
    }

    SMK.TYPE.LocationTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        this.showPopup = function ( loc ) {
            // self.popupModel.site = site

            smk.$viewer.view.popup.actions = []
            smk.$viewer.view.popup.dockOptions = { buttonEnabled: false }
            smk.$viewer.view.popup.open( {
                content: self.vm.$el,
                location: loc
            } )
        }

        this.updatePopup = function () {
            smk.$viewer.view.popup.content = self.vm.$el
        }

        // this.popup = L.popup( {
        //     maxWidth: 100,
        //     closeButton: false,
        // } )
        // .setContent( function () { return self.vm.$el } )

        this.locationMarker = new E.layers.GraphicsLayer()
        smk.$viewer.map.add( this.locationMarker )

        this.setLocation = function ( location ) {
            this.location = location

            this.locationMarker.removeAll()

            var g = { type: 'point', latitude: location.map.latitude, longitude: location.map.longitude }
            this.locationMarker.add( new E.Graphic( {
                geometry: g,
                symbol: blueSymbol
            } ) )

            this.showPopup( g )
        }

        this.reset = function () {
            smk.$viewer.view.popup.close()
            this.locationMarker.removeAll()
            this.site = {}
        }

    } )


} )
