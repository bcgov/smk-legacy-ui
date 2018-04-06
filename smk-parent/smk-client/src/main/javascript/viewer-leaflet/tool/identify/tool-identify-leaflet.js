include.module( 'tool-identify-leaflet', [ 'leaflet', 'tool-identify' ], function ( inc ) {

    SMK.TYPE.IdentifyTool.prototype.styleFeature = function () {
        return {
            // color:       '#ffff00',
            // weight:      2,
            // opacity:     0.7,
            // fillColor:   '#ffa500',
            // fillOpacity: 0.1,
            color:       'black',
            weight:      3,
            opacity:     0.8,
            fillColor:   'white',
            fillOpacity: 0.5,
        }
    }

    SMK.TYPE.IdentifyTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        var vw = smk.$viewer
        var featureSet = smk.$viewer.identified

        this.marker = {}
        this.cluster = L.markerClusterGroup( {
                singleMarkerMode: true,
                zoomToBoundsOnClick: false,
                spiderfyOnMaxZoom: false,
                iconCreateFunction: function ( cluster ) {
                    var count = cluster.getChildCount();

                    return new L.DivIcon( {
                        html: '<div><span>' + ( count == 1 ? '' : count > 99 ? '>99' : count ) + '</span></div>',
                        className: 'smk-identify-cluster smk-identify-cluster-' + ( count == 1 ? 'one' : 'many' ),
                        iconSize: null
                    } )
                }
            } )
            .on( {
                clusterclick: function ( ev ) {
                    var featureIds = ev.layer.getAllChildMarkers().map( function ( m ) {
                        return m.options.featureId
                    } )

                    featureSet.pick( featureIds[ 0 ], { cluster: true, position: ev.latlng } )
                },
                click: function ( ev ) {
                    featureSet.pick( ev.layer.options.featureId, { cluster: true, position: ev.latlng } )
                },
            } )

        self.changedActive( function () {
            if ( self.active ) {
                self.cluster.addTo( vw.map )
            }
            else {
                vw.map.removeLayer( self.cluster )
            }
        } )                
                
        featureSet.addedFeatures( function ( ev ) {
            ev.features.forEach( function ( f ) {
                var center
                switch ( turf.getType( f ) ) {
                case 'Point':
                    center = L.GeoJSON.coordsToLatLng( f.geometry.coordinates )
                    break;

                case 'MultiPoint':
                    center = [ f._identifyPoint.latitude, f._identifyPoint.longitude ]
                    break;

                default:
                    center = [ f._identifyPoint.latitude, f._identifyPoint.longitude ]

                    self.highlight[ f.id ] = L.geoJSON( f.geometry, {
                        style: self.styleFeature
                    } )                
                }

                self.marker[ f.id ] = L.marker( center, {
                    featureId: f.id
                } )

                self.cluster.addLayer( self.marker[ f.id ] )
            } )
        } )

        featureSet.pickedFeature( function ( ev ) {
            if ( !ev.feature ) return

            var ly = self.marker[ ev.feature.id ]
            var parent = self.cluster.getVisibleParent( ly )

            if ( ly === parent ) {
                self.popupModel.hasMultiple = false
                self.popupFeatureIds = null
                self.popupCurrentIndex = null

                self.popup
                    .setLatLng( ly.getLatLng() )
                    .openOn( vw.map )
            }
            else {
                var featureIds = parent.getAllChildMarkers().map( function ( m ) {
                    return m.options.featureId
                } )

                self.popupModel.hasMultiple = true
                self.popupCurrentIndex = featureIds.indexOf( ev.feature.id )
                self.popupModel.position = ( self.popupCurrentIndex + 1 ) + ' / ' + featureIds.length
                self.popupFeatureIds = featureIds

                self.popup
                    .setLatLng( parent.getLatLng() )
                    .openOn( vw.map )
            }
        } )

        featureSet.zoomToFeature( function ( ev ) {
            var old = featureSet.pick( null )            

            switch ( turf.getType( ev.feature ) ) {
            case 'Point':
                self.cluster.zoomToShowLayer( self.marker[ ev.feature.id ], function () {
                    if ( old )
                        featureSet.pick( old )
                } )
                break;
            
            default:
                if ( self.highlight[ ev.feature.id ] )
                    smk.$viewer.map
                        .once( 'zoomend moveend', function () {
                            if ( old )
                                featureSet.pick( old )
                        } )
                        .fitBounds( self.highlight[ ev.feature.id ].getBounds(), {
                            paddingTopLeft: L.point( 300, 100 ),
                            animate: true
                        } )
            }
        } )

        featureSet.clearedFeatures( function ( ev ) {
            self.cluster.clearLayers()
            self.marker = {}
        } )

    } )


} )
