include.module( 'tool-directions-leaflet', [ 'leaflet', 'tool-directions' ], function ( inc ) {

    var base = include.option( 'baseUrl' ) + '/tool/directions'

    var redIcon = new L.Icon( {
        iconUrl:        base + '/marker-icon-red.png',
        shadowUrl:      base + '/marker-shadow.png',
        iconSize:       [ 25, 41 ],
        iconAnchor:     [ 12, 41 ],
        popupAnchor:    [ 1, -34 ],
        shadowSize:     [ 41, 41 ]
    } )

    var greenIcon = new L.Icon( {
        iconUrl:        base + '/marker-icon-green.png',
        shadowUrl:      base + '/marker-shadow.png',
        iconSize:       [ 25, 41 ],
        iconAnchor:     [ 12, 41 ],
        popupAnchor:    [ 1, -34 ],
        shadowSize:     [ 41, 41 ]
    } )

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


    SMK.TYPE.DirectionsTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        this.changedActive( function () {
            if ( self.active ) {
            }
            else {
                reset()
            }
        } )

        this.displayRoute = function ( points ) {
            reset()

            if ( !points ) return

            self.routeLayer = L.geoJson( {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: points
                }
            }, {
                onEachFeature: function( feature, layer ) {
                    var color = "#0000FF";
                    layer.setStyle( { color:color, weight:7, opacity: 0.5 } );
                }
            } )

            smk.$viewer.map.addLayer( self.routeLayer )

            bounds = self.routeLayer.getBounds()

            smk.$viewer.map.fitBounds( bounds.pad( 0.25 ) )
        }

        this.displayWaypoints = function () {
            if ( self.waypointLayers && self.waypointLayers.length > 0 ) {
                self.waypointLayers.forEach( function ( l ) {
                    smk.$viewer.map.removeLayer( l )
                } )
            }

            var last = self.waypoints.length - 2
            self.waypointLayers = self.waypoints
                .filter( function ( w ) { return !!w.location } )
                .map( function ( w, i ) {
                    var icon, prefix
                    switch ( i ) {
                    case 0:
                        icon = greenIcon
                        prefix = 'START HERE:\n'
                        break;
                    case last:
                        icon = redIcon
                        prefix = 'END HERE:\n'
                        break;
                    default:
                        icon = new L.NumberedIcon( { number: i } )
                        prefix = 'STOPOVER ' + i + ':\n'
                        break;
                    }

                    return L.marker( [ w.location.latitude, w.location.longitude ], {
                            title: prefix + w.description,
                            icon: icon
                        } )
                        .bindPopup( $( '<pre class="smk-popup">' ).text( prefix + w.description ).get( 0 ) )
                        .addTo( smk.$viewer.map )
                } )
        }

        function reset() {
            if ( self.routeLayer )
                smk.$viewer.map.removeLayer( self.routeLayer )
            self.routeLayer = null

            if ( self.directionHighlightLayer )
                smk.$viewer.map.removeLayer( self.directionHighlightLayer )
            self.directionHighlightLayer = null

            if ( self.directionPickLayer )
                smk.$viewer.map.removeLayer( self.directionPickLayer )
            self.directionPickLayer = null

            if ( self.waypointLayers && self.waypointLayers.length > 0 ) {
                self.waypointLayers.forEach( function ( l ) {
                    smk.$viewer.map.removeLayer( l )
                } )
            }
            self.waypointLayers = null
        }

        aux.panel.vm.$on( 'directions-panel.hover-direction', function ( ev ) {
            if ( self.directionHighlightLayer ) {
                smk.$viewer.map.removeLayer( self.directionHighlightLayer )
                self.directionHighlightLayer = null
            }

            if ( !ev.highlight )
                return

            var p = self.directions[ ev.highlight ].point
            self.directionHighlightLayer = L.circleMarker( [ p[ 1 ], p[ 0 ] ] )
                .bindPopup( self.directions[ ev.highlight ].instruction, { closeButton: false } )
                .addTo( smk.$viewer.map )
                .openPopup()
        } )

        aux.panel.vm.$on( 'directions-panel.pick-direction', function ( ev ) {
            if ( self.directionPickLayer ) {
                smk.$viewer.map.removeLayer( self.directionPickLayer )
                self.directionPickLayer = null
            }

            if ( !ev.pick )
                return

            var p = self.directions[ ev.pick ].point
            self.directionPickLayer = L.circleMarker( [ p[ 1 ], p[ 0 ] ], { radius: 15 } )
                .bindPopup( self.directions[ ev.pick ].instruction )
                .addTo( smk.$viewer.map )
                .openPopup()

            smk.$viewer.map.panTo( [ p[ 1 ], p[ 0 ] ] )
        } )

        aux.panel.vm.$on( 'directions-panel.clear', function ( ev ) {
            reset()
        } )

        aux.panel.vm.$on( 'directions-panel.zoom-waypoint', function ( ev ) {
            smk.$viewer.map.panTo( [ ev.location.latitude, ev.location.longitude ] )
            self.waypointLayers[ ev.index ].openPopup()
        } )

    } )


} )
