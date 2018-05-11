include.module( 'tool-directions-esri3d', [ 'esri3d', 'types-esri3d', 'util-esri3d', 'tool-directions' ], function ( inc ) {

    var E = SMK.TYPE.Esri3d

    var base = include.option( 'baseUrl' ) + '/tool/directions'

    var redSymbol = {
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

    var greenSymbol = {
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
                    href:   base + '/marker-icon-green.png',
                }
            }
        ]
    }

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
                    href:   base + '/marker-icon-hole.png',
                }
            }
        ]
    }

    // L.NumberedIcon = L.Icon.extend( {
    //     options: {
    //         number:         '',
    //         iconUrl:        base + '/marker-icon-hole.png',
    //         shadowUrl:      base + '/marker-shadow.png',
    //         iconSize:       [ 25, 41 ],
    //         iconAnchor:     [ 13, 41 ],
    //         popupAnchor:    [ 0, -33 ],
    //         shadowSize:     [ 41, 41 ]
    //     },

    //     createIcon: function () {
    //         var div = document.createElement( 'div' )
    //         var img = this._createImg( this.options.iconUrl )
    //         var numdiv = document.createElement( 'div' )
    //         numdiv.setAttribute ( 'class', 'number' )
    //         numdiv.innerHTML = this.options.number || ''
    //         div.appendChild ( img )
    //         div.appendChild ( numdiv )
    //         this._setIconStyles( div, 'icon' )
    //         return div
    //     }
    // } )


    SMK.TYPE.DirectionsTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        this.changedActive( function () {
            if ( self.active ) {
                smk.$viewer.view.padding = { left: 340 }
            }
            else {
                reset()
                smk.$viewer.view.padding = { left: 0 }
            }
        } )

        this.showPopup = function ( site, loc ) {
            self.popupModel.site = site

            smk.$viewer.view.popup.actions = []
            smk.$viewer.view.popup.dockOptions = { buttonEnabled: false }

            smk.$viewer.view.popup.open( {
                content: self.popupVm.$el,
                location: loc
            } )
        }

        this.updatePopup = function () {
            smk.$viewer.view.popup.content = self.popupVm.$el
        }

        this.pickLocation = ( function ( outer ) {
            return function ( location ) {
                smk.$viewer.view.hitTest( location.screen )
                    .then( function ( hit ) {
                        // console.log( arguments  )
                        if ( hit.results.length > 0 ) {
                            if ( hit.results[ 0 ].graphic ) {
                                self.showPopup( hit.results[ 0 ].graphic.attributes, hit.results[ 0 ].graphic.geometry )
                                return
                            }
                        }
                        return outer( location )
                    } )
            }
         } )( this.pickLocation )


        this.displayRoute = function ( points ) {
            reset()

            if ( !points ) return

            var geojson = {
                type: 'FeatureCollection',
                features: [ {
                    geometry: {
                        type: 'LineString',
                        coordinates: points
                    }
                } ]
            }

            self.routeLayer = new E.layers.GraphicsLayer( {
                graphics: SMK.UTIL.geoJsonToEsriGeometry( geojson, SMK.UTIL.smkStyleToEsriSymbol( {
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.5,
                    strokeWidth: 7,
                } ) )
            } )

            smk.$viewer.map.add( self.routeLayer )

            smk.$viewer.view.goTo( self.routeLayer.graphics )
        }

        this.displayWaypoints = function () {
            if ( self.waypointLayers && self.waypointLayers.length > 0 ) {
                smk.$viewer.map.removeMany( self.waypointLayers )
            }

            var last = self.waypoints.length - 1
            self.waypointLayers = self.waypoints
                .map( function ( w, i ) {
                    var symbol
                    var popup = Object.assign( {
                        index: i
                    }, w )

                    switch ( i ) {
                    case 0:
                        symbol = greenSymbol
                        popup.first = true
                        break;

                    case last:
                        symbol = redSymbol
                        popup.last = true
                        break;

                    default:
                        symbol = blueSymbol
                        break;
                    }

                    var ly = new E.layers.GraphicsLayer( {
                        graphics: [ new E.Graphic( {
                            geometry: { type: 'point', latitude: w.latitude, longitude: w.longitude },
                            symbol: symbol,
                            attributes: popup
                        } ) ]
                    } )

                    smk.$viewer.map.add( ly )

                    return ly
                } )
        }

        function reset() {
            if ( self.routeLayer )
                smk.$viewer.map.remove( self.routeLayer )
            self.routeLayer = null

            self.directionHighlightLayer.removeAll()

            if ( self.directionPickLayer )
                smk.$viewer.map.remove( self.directionPickLayer )
            self.directionPickLayer = null

            if ( self.waypointLayers && self.waypointLayers.length > 0 ) {
                smk.$viewer.map.removeMany( self.waypointLayers )
            }
            self.waypointLayers = null

            smk.$viewer.view.popup.close()
        }

        self.directionHighlightLayer = new E.layers.GraphicsLayer()
        smk.$viewer.map.add( self.directionHighlightLayer )


        smk.on( this.id, {
            'hover-direction': function ( ev ) {
                self.directionHighlightLayer.removeAll()

                if ( ev.highlight == null ) return

                var p = self.directions[ ev.highlight ].point
                var g = { type: 'point', latitude: p[ 1 ], longitude: p[ 0 ] }

                self.directionHighlightLayer.add( new E.Graphic( {
                    geometry: g,
                    symbol: {
                        type: 'point-3d',
                        symbolLayers: [
                            {
                                type:       'icon',
                                size:       '20px',
                                anchor:     'center',
                                material: {
                                    color: [ 0, 0, 0, 0 ]
                                },
                                resource: {
                                    primitive: 'circle'
                                },
                                outline: {
                                    color: 'blue',
                                    size: '2px'
                                }
                            }
                        ]
                    }
                } ) )

                smk.$viewer.view.goTo( { center: p, zoom: 12 } ).then( function () {
                    self.showPopup( self.directions[ ev.highlight ], g )
                } )
            },

            'pick-direction': function ( ev ) {
                // if ( self.directionPickLayer ) {
                //     smk.$viewer.map.removeLayer( self.directionPickLayer )
                //     self.directionPickLayer = null
                // }

                // if ( !ev.pick )
                //     return

                // var p = self.directions[ ev.pick ].point
                // self.directionPickLayer = L.circleMarker( [ p[ 1 ], p[ 0 ] ], { radius: 15 } )
                //     .bindPopup( self.directions[ ev.pick ].instruction, {
                //         autoPanPaddingTopLeft: L.point( 340, 40 ),
                //         autoPanPaddingBottomRight: L.point( 40, 40 )
                //     } )
                //     .addTo( smk.$viewer.map )
                //     .openPopup()

                // smk.$viewer.map.panTo( [ p[ 1 ], p[ 0 ] ] )
            },

            'clear': function ( ev ) {
                reset()
            },

            'zoom-waypoint': function ( ev ) {
                var ly = self.waypointLayers[ ev.index ].graphics.items[ 0 ]
                var w = ev.waypoint

                smk.$viewer.view.goTo( { center: [ w.longitude, w.latitude ], zoom: 12 } ).then( function () {
                    self.showPopup( ly.attributes, { type: 'point', latitude: w.latitude, longitude: w.longitude } )
                } )
            }
        } )
    } )


} )
