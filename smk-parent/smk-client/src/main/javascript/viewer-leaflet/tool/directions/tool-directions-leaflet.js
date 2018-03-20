include.module( 'tool-directions-leaflet', [ 'leaflet', 'tool-directions' ], function ( inc ) {

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
