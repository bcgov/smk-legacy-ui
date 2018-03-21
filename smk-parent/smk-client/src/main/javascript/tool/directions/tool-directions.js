include.module( 'tool-directions', [ 'smk', 'tool', 'widgets', 'tool-directions.panel-directions-html', 'tool-directions.popup-directions-html' ], function ( inc ) {

    var request

    function findRoute( wayPoints, option ) {
        if ( request )
            request.abort()

        var query = {
            points:     wayPoints.map( function ( w ) { return w.location.longitude + ',' + w.location.latitude } ).join( ',' ),
            outputSRS:  4326,
            criteria:   option.criteria,
            roundTrip:  option.roundTrip
        }

        return SMK.UTIL.makePromise( function ( res, rej ) {
            ( request = $.ajax( {
                timeout:    10 * 1000,
                dataType:   'json',
                url:        'https://routerdlv.api.gov.bc.ca/' + ( option.optimal ? 'optimalDirections' : 'directions' ) + '.json',
                data:       query,
                headers: {
                    apikey: 'ndLv6oEJN4z5FwwhDyaNoF4NfnYWXwVJ'
                }
            } ) ).then( res, rej )
        } )
        .then( function ( data ) {
            if ( !data.routeFound ) throw new Error( 'failed to find route' )

            return data
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    Vue.component( 'directions-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'directions-panel', {
        template: inc[ 'tool-directions.panel-directions-html' ],
        props: [ 'busy', 'waypoints', 'waypointsId', 'directions', 'directionHighlight', 'directionPick', 'summary' ],
        data: function () {
            return {
                optimal:    true,
                roundTrip:  false,
                criteria:   'shortest'
            }
        },
        // mounted: function ( el ) {
        //     var self = this

        //     this.waypointsSortable = Sortable.create( document.getElementById( this.waypointsId ), {
        //         handle:         '.smk-handle',
        //         draggable:      '.smk-waypoint',
        //         forceFallback:  true,
        //         // onUpdate: function ( ev ) {
        //         //     console.log( ev, self.waypoints.map( function ( w ) { return w.site } ) )
        //         //     self.waypoints.splice( ev.newIndex, 0, self.waypoints.splice( ev.oldIndex, 1 )[ 0 ] )
        //         //     // self.wayPoints.splice( ev.newIndex, )
        //         //     console.log( ev, self.waypoints.map( function ( w ) { return w.site } ) )
        //         //     self.$forceUpdate()
        //         // },
        //         onMove: function ( ev ) {
        //             console.log( ev )
        //             return false
        //         }
        //     } )                
        // },
        methods: {
            isEmpty: function () {
                return !this.layers || this.layers.length == 0
            }
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function DirectionsTool( option ) {
        this.makePropWidget( 'icon', 'directions_car' )
        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'waypoints', [] )
        this.makePropPanel( 'waypointsId', SMK.UTIL.uniqueId() )
        this.makePropPanel( 'directions', [] )
        this.makePropPanel( 'directionHighlight', null )
        this.makePropPanel( 'directionPick', null )
        this.makePropPanel( 'summary', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          4,
            title:          'Directions',
            widgetComponent:'directions-widget',
            panelComponent: 'directions-panel',
        }, option ) )

        this.routeOption = {
            optimal:    true,
            roundTrip:  false,
            criteria:   'shortest'
        }
    }

    SMK.TYPE.DirectionsTool = DirectionsTool

    $.extend( DirectionsTool.prototype, SMK.TYPE.Tool.prototype )
    DirectionsTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    DirectionsTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        smk.$viewer.handlePick( this, function ( location ) {
            // smk.$viewer.identifyFeatures( location )
        } )

        aux.widget.vm.$on( 'directions-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )

        aux.panel.vm.$on( 'directions-panel.option', function ( ev, comp ) {
            self.routeOption.optimal = comp.optimal
            self.routeOption.roundTrip = comp.roundTrip
            self.routeOption.criteria = comp.criteria
            self.findRoute()
        } )

        aux.panel.vm.$on( 'directions-panel.hover-direction', function ( ev ) {
            self.directionHighlight = ev.highlight
        } )        

        aux.panel.vm.$on( 'directions-panel.pick-direction', function ( ev ) {
            self.directionPick = ev.pick
        } )        

        aux.panel.vm.$on( 'directions-panel.waypoints-changed', function ( ev ) {
            console.log( self.waypoints.map( function ( w ) { return w.site } ) )
        } )        
            

        // this.changedActive( function () {
        //     if ( !self.active ) return

        //     self.waypointsSortable = Sortable.create( document.getElementById( self.waypointsId ), {
        //         handle:         '.smk-handle',
        //         draggable:      '.smk-waypoint',
        //         forceFallback:  true,
        //         onUpdate: function ( ev ) {
        //             console.log( ev )
        //         }
        //     } )                
        // } )
    } )

    DirectionsTool.prototype.addWaypoint = function ( locations ) {}

    DirectionsTool.prototype.setWaypoints = function ( locations ) {
        this.active = true

        this.waypoints = locations.map( function ( l ) {
            return {
                location: { latitude: l.location.latitude, longitude: l.location.longitude },
                site: l.site.fullAddress
            }
        } )

        this.findRoute()
    }

    DirectionsTool.prototype.findRoute = function () {
        var self = this

        if ( this.waypoints.length < 2 ) return

        findRoute( this.waypoints, this.routeOption ).then( function ( data ) {
            self.displayRoute( data.route )

            self.summary = 'Route travels ' + data.distance + ' km in ' + data.timeText

            self.directions = data.directions.map( function ( d ) {
                d.text = d.text.replace( /\sfor\s(\d+.?\d*\sk?m\s.+)$/, function ( m, p1 ) {
                    d.metric = p1
                    return ''
                } )
                return d
            } )
        } )
    }

    return DirectionsTool
} )


        // aux.panel.vm.$on( 'directions-panel.active', function ( ev ) {
        //     smk.$viewer.identified.pick( ev.feature.id )
        // } )

        // aux.panel.vm.$on( 'directions-panel.hover', function ( ev ) {
        //     smk.$viewer.identified.highlight( ev.features && ev.features.map( function ( f ) { return f.id } ) )
        // } )

        // aux.panel.vm.$on( 'directions-panel.add-all', function ( ev ) {
        // } )

        // aux.panel.vm.$on( 'directions-panel.clear', function ( ev ) {
        //     smk.$viewer.identified.clear()
        // } )

        // smk.$viewer.startedIdentify( function ( ev ) {
        //     self.busy = true
        // } )

        // smk.$viewer.finishedIdentify( function ( ev ) {
        //     self.busy = false
        // } )

        // smk.$viewer.identified.addedFeatures( function ( ev ) {
        //     self.active = true
        //     // sb.vm.$emit( 'activate-tool', { active: true, id: 'identify' } )

        //     var ly = smk.$viewer.layerId[ ev.layerId ]

        //     self.layers[ ly.index ] = {
        //         id: ly.config.id,
        //         title: ly.config.title,
        //         features: ev.features
        //     }
        // } )

        // // smk.$viewer.identified.removedFeatures( function ( ev ) {
        // // } )

        // smk.$viewer.identified.pickedFeature( function ( ev ) {
        //     self.highlightId = ev.feature && ev.feature.id
        // } )

        // // smk.$viewer.identified.highlightedFeatures( function ( ev ) {
        // // } )

        // smk.$viewer.identified.clearedFeatures( function ( ev ) {
        //     self.layers = []
        // } )

        // var el = smk.addToContainer( inc[ 'tool-directions.popup-directions-html' ] )

        // var popupModel = {
        //     feature: null,
        //     layer: null
        // }

        // this.popupVm = new Vue( {
        //     el: el,
        //     data: popupModel,
        //     methods: {
        //         debug: function ( x ) {
        //             console.log( arguments )
        //             return x
        //         },
        //         zoomToFeature: function ( layer, feature ) {
        //             return smk.$viewer.zoomToFeature( layer, feature )
        //         },
        //         directionsToFeature: function ( layer, feature ) {
        //             return smk.$viewer.directionsToFeature( layer, feature )
        //         },
        //         selectFeature: function ( layer, feature ) {
        //             smk.$viewer.selected.add( layer.config.id, [ feature ] )
        //         }
        //     }
        // } )

        // smk.$viewer.identified.pickedFeature( function ( ev ) {
        //     if ( !ev.feature ) return

        //     popupModel.feature = ev.feature
        //     popupModel.layer = smk.$viewer.layerId[ ev.feature.layerId ]
        // } )

        // smk.$viewer.getIdentifyPopupEl = function () { return self.popupVm.$el }




    // function doRouteRequest(query, params, center) {
    //     if(routeRequest != null) {
    //         routeRequest.abort();
    //     }
    //     routeRequest = $.ajax({
    //         url: routeApi + query + (routeMethod == 'GET' ? '?apikey=' + apiKey : ''),
    //         method: routeMethod,
    //         headers: routeHeaders,
    //         data: params,
    //         success: function(data) {
    //             clearRoute();
    //             // if a valid route was returned
    //             if(data.route && data.route.length > 1) {
    //                 routeLayer = L.geoJson({
    //                         type: "Feature",
    //                         properties: {},
    //                         geometry: {
    //                             type: "LineString",
    //                             coordinates: data.route
    //                         }
    //                     }, {
    //                     onEachFeature: function(feature, layer) {
    //                         var color = "#0000FF";
    //                         if(params['criteria'] == "fastest") {
    //                             color = "#FF00FF";
    //                         }
    //                         layer.setStyle({color:color, weight:7, opacity: 0.5});
    //                     }
    //                 }).addTo(map);
    //                 centerMap(routeLayer.getBounds(), center);

    //                 // update icon numbering
    //                 $('#routerList input.input-field').each( function(index, element) {
    //                     var layer = $(element).data('marker');
    //                     if(data.visitOrder) {
    //                         index = data.visitOrder[index];
    //                         if(index == data.visitOrder.length - 1) {
    //                             index = -1;
    //                         }
    //                     } else if($(element).parents('div.form-group').next().length == 0) {
    //                         index = -1;
    //                     }
    //                     if(layer) {
    //                         layer.getLayers()[0].setIcon(getRouteIcon(index));
    //                     }
    //                 });
    //             }

    //             // var $last;
    //             // if(data.visitOrder) {
    //             // 	$last = $('#routerList input.input-field:nth-child(' + (data.visitOrder[data.visitOrder.length-1] + 1) +')');
    //             // } else {
    //             // 	$last = $('#routerList input.input-field').filter(':last');
    //             // }
    //             // if($last.data('marker')) {
    //             // 	$last.data('marker').getLayers()[0].setIcon(getRouteIcon(-1));
    //             // }
    //             if(data.routeFound) {
    //                 $('#timing').html('Route calculated in ' + data.executionTime/1000 + ' seconds<br\>Route travels ' + data.distance + ' km in ' + data.timeText + '<br\>Directions:');
    //                 var dirs = data.directions;
    //                 for(i = 0; i < dirs.length; i++) {
    //                     if(dirs[i].text) {
    //                         var $dir = $("<div class=\"direction\">" + dirs[i].text + "</div>");
    //                         $('#directions').append($dir);
    //                         $dir.data('latlng', {'lat': dirs[i].point[1], 'lng': dirs[i].point[0]}) ;
    //                     } else {
    //                         $('#directions').append("<div class=\"direction\">" + dirs[i] + "</div>");
    //                     }
    //                 }
    //             } else {
    //                 $('#timing').html('No route exists in the BC Digital Road Atlas<br\>');
    //             }
    //         },
    //         error: function(request) {
    //             if(request.statusText != "abort") {
    //                 alert(baseErrorMsg + "Error retrieving route results, please try your route again.");
    //                 $('#timing').html("Error retrieving route results, please try your route again.");
    //                 console.log(request);
    //             }
    //         }
    //     });
    // }

