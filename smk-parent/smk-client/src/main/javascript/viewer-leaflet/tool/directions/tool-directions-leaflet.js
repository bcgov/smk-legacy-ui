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

        this.displayRoute = function ( points ) {
            var routeLayer = L.geoJson( {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: data.route
                }
            }, {
                onEachFeature: function( feature, layer ) {
                    var color = "#0000FF";
                    // if(params['criteria'] == "fastest") {
                    //     color = "#FF00FF";
                    // }
                    layer.setStyle( { color:color, weight:7, opacity: 0.5 } );
                }
            } ).addTo( smk.$viewer.map );

            bounds = routeLayer.getBounds()

            // function centerMap(bounds, center = true) {
            //     var options = {
            //         maxZoom: 16
            //     };
            //     if(tabs) {
            //         options.paddingTopLeft = [400,0];
            //     }
                // if(center) {
            smk.$viewer.map.fitBounds( bounds.pad( 0.25 ) )
                // } else if(!map.getBounds().contains(bounds.pad(0.25))) {
                    // if the bounds aren't within the current map bounds
                    // zoom out to include the bounds
                    // map.fitBounds(bounds.extend(map.getBounds()).pad(0.25), options);
                // }
            // }

        }
    } )


} )
