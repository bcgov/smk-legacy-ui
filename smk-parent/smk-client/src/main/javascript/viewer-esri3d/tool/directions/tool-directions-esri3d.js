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

    // var greenSymbol = {
    //     type:       'picture-marker',
    //     url:        base + '/marker-icon-green.png',
    //     width:      '25px',
    //     height:     '41px',
    //     xoffset:    '12px',
    //     yoffset:    '41px',
    // }

    // var redSymbol = {
    //     type:       'picture-marker',
    //     url:        base + '/marker-icon-red.png',
    //     width:      '25px',
    //     height:     '41px',
    //     xoffset:    '12px',
    //     yoffset:    '41px',
    // }

    // var redIcon = new L.Icon( {
    //     iconUrl:        base + '/marker-icon-red.png',
    //     shadowUrl:      base + '/marker-shadow.png',
    //     iconSize:       [ 25, 41 ],
    //     iconAnchor:     [ 12, 41 ],
    //     popupAnchor:    [ 1, -34 ],
    //     shadowSize:     [ 41, 41 ]
    // } )

    // var greenIcon = new L.Icon( {
    //     iconUrl:        base + '/marker-icon-green.png',
    //     shadowUrl:      base + '/marker-shadow.png',
    //     iconSize:       [ 25, 41 ],
    //     iconAnchor:     [ 12, 41 ],
    //     popupAnchor:    [ 1, -34 ],
    //     shadowSize:     [ 41, 41 ]
    // } )

    L.NumberedIcon = L.Icon.extend( {
        options: {
            number:         '',
            iconUrl:        base + '/marker-icon-hole.png',
            shadowUrl:      base + '/marker-shadow.png',
            iconSize:       [ 25, 41 ],
            iconAnchor:     [ 13, 41 ],
            popupAnchor:    [ 0, -33 ],
            shadowSize:     [ 41, 41 ]
        },

        createIcon: function () {
            var div = document.createElement( 'div' )
            var img = this._createImg( this.options.iconUrl )
            var numdiv = document.createElement( 'div' )
            numdiv.setAttribute ( 'class', 'number' )
            numdiv.innerHTML = this.options.number || ''
            div.appendChild ( img )
            div.appendChild ( numdiv )
            this._setIconStyles( div, 'icon' )
            return div
        }
    } )


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

        this.pickLocation = ( function ( outer ) {
            return function ( location ) {
                smk.$viewer.view.hitTest( location.screen )
                    .then( function () {
                        console.log( arguments  )
                    } )
                return outer( location )
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

            var last = self.waypoints.length - 2
            self.waypointLayers = self.waypoints
                .filter( function ( w ) { return !!w.location } )
                .map( function ( w, i ) {
                    var symbol, prefix
                    switch ( i ) {
                    case 0:
                        symbol = greenSymbol
                        prefix = 'START HERE:\n'
                        break;
                    case last:
                        symbol = redSymbol
                        prefix = 'END HERE:\n'
                        break;
                    default:
                        symbol = blueSymbol
                        // symbol = new L.NumberedIcon( { number: i } )
                        prefix = 'STOPOVER ' + i + ':\n'
                        break;
                    }

                    var ly = new E.layers.GraphicsLayer( {
                        graphics: [ new E.Graphic( {
                            // geometry: Object.assign( { type: 'point' }, w.location ),
                            geometry: { type: 'point', latitude: w.location.latitude, longitude: w.location.longitude },
                            symbol: symbol,
                            attributes: {
                                position:       i,
                                last:           last,
                                description:    w.description
                            }
                        } ) ]
                    } )


                    smk.$viewer.map.add( ly )

                    return ly

                    // return L.marker( [ w.location.latitude, w.location.longitude ], {
                    //         title: prefix + w.description,
                    //         icon: icon
                    //     } )
                    //     .bindPopup( $( '<pre class="smk-popup">' ).text( prefix + w.description ).get( 0 ), {
                    //         autoPanPaddingTopLeft: L.point( 340, 40 ),
                    //         autoPanPaddingBottomRight: L.point( 40, 40 )
                    //     } )
                    //     .addTo( smk.$viewer.map )
                } )
        }

        function reset() {
            if ( self.routeLayer )
                smk.$viewer.map.remove( self.routeLayer )
            self.routeLayer = null

            if ( self.directionHighlightLayer )
                smk.$viewer.map.remove( self.directionHighlightLayer )
            self.directionHighlightLayer = null

            if ( self.directionPickLayer )
                smk.$viewer.map.remove( self.directionPickLayer )
            self.directionPickLayer = null

            if ( self.waypointLayers && self.waypointLayers.length > 0 ) {
                smk.$viewer.map.removeMany( self.waypointLayers )
            }
            self.waypointLayers = null
        }

        smk.on( this.id, {
            'hover-direction': function ( ev ) {
                if ( self.directionHighlightLayer ) {
                    smk.$viewer.map.removeLayer( self.directionHighlightLayer )
                    self.directionHighlightLayer = null
                }

                if ( !ev.highlight )
                    return

                var p = self.directions[ ev.highlight ].point
                self.directionHighlightLayer = L.circleMarker( [ p[ 1 ], p[ 0 ] ] )
                    .bindPopup( self.directions[ ev.highlight ].instruction, {
                        closeButton: false,
                        autoPanPaddingTopLeft: L.point( 340, 40 ),
                        autoPanPaddingBottomRight: L.point( 40, 40 )
                    } )
                    .addTo( smk.$viewer.map )
                    .openPopup()
            },

            'pick-direction': function ( ev ) {
                if ( self.directionPickLayer ) {
                    smk.$viewer.map.removeLayer( self.directionPickLayer )
                    self.directionPickLayer = null
                }

                if ( !ev.pick )
                    return

                var p = self.directions[ ev.pick ].point
                self.directionPickLayer = L.circleMarker( [ p[ 1 ], p[ 0 ] ], { radius: 15 } )
                    .bindPopup( self.directions[ ev.pick ].instruction, {
                        autoPanPaddingTopLeft: L.point( 340, 40 ),
                        autoPanPaddingBottomRight: L.point( 40, 40 )
                    } )
                    .addTo( smk.$viewer.map )
                    .openPopup()

                smk.$viewer.map.panTo( [ p[ 1 ], p[ 0 ] ] )
            },

            'clear': function ( ev ) {
                reset()
            },

            'zoom-waypoint': function ( ev ) {
                smk.$viewer.map.flyTo( [ ev.location.latitude, ev.location.longitude ], 12 )
                self.waypointLayers[ ev.index ].openPopup()
            }
        } )
    } )


} )
