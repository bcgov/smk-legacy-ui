include.module( 'tool-search', [ 'smk', 'sidebar', 'tool-search.panel-search-html' ], function ( inc ) {

    var precisionSize = { // meters
        INTERSECTION:   100,
        STREET:         1000,
        BLOCK:          200,
        CIVIC_NUMBER:   50
    }

    return {
        order: 5,
        initialize: function ( smk, option ) {
            var sb = smk.getSidebar()

            var model = sb.addPanel( 'search', {
                button: { title: 'Search', icon: 'search' },
                panel: {
                    busy: false,
                    results: [],
                    highlightId: null
                }
            } )

            sb.vm.$on( 'searchPanel.input-change', function ( ev ) {
                smk.$viewer.searched.clear()

                model.busy = true
                doAddressSearch( ev.text )
                    .then( function ( features ) {
                        smk.$viewer.searched.add( 'search', features, 'fullAddress' )
                        model.busy = false
                    } )
            } )

            sb.vm.$on( 'searchPanel.hover', function ( ev ) {
                smk.$viewer.searched.highlight( ev.result ? [ ev.result.id ] : [] )
            } )

            sb.vm.$on( 'searchPanel.pick', function ( ev ) {
                smk.$viewer.searched.pick( ev.result.id )
            } )

            sb.vm.$on( 'searchPanel.clear', function ( ev ) {
                smk.$viewer.searched.clear()
            } )


            smk.$viewer.searched.addedFeatures( function ( ev ) {
                model.results = ev.features
            } )

            // // smk.$viewer.selected.removedFeatures( function ( ev ) {
            // // } )

            smk.$viewer.searched.pickedFeature( function ( ev ) {
                model.highlightId = ev.feature && ev.feature.id
            } )

            // // smk.$viewer.selected.highlightedFeatures( function ( ev ) {
            // // } )

            smk.$viewer.searched.clearedFeatures( function ( ev ) {
                model.results = []
            } )


            Vue.component( 'searchPanel', {
                template: inc[ 'tool-search.panel-search-html' ],
                props: [ 'results', 'busy', 'highlightId' ],
                methods: {
                    isEmpty: function () {
                        return !this.results || this.results.length == 0
                    }
                },
                data: function () {
                    return {
                        search: null
                    }
                }
            } )

        }
    }

    var request

    function doAddressSearch( text ) {
        if ( request )
            request.abort()

        var query = {
            ver:            1.2,
            maxResults:     20,
            outputSRS:      4326,
            addressString:  text,
            autoComplete:   true
        }

        request = $.ajax( {
            timeout:    10 * 1000,
            dataType:   'jsonp',
            url:        'https://apps.gov.bc.ca/pub/geocoder/addresses.geojsonp',
            data:       query,
        } )

        return request.then( function ( data ) {
            return $.map( data.features, function ( feature ) {
                if ( !feature.geometry.coordinates ) return;

                // exclude whole province match
                if ( feature.properties.fullAddress == 'BC' ) return;

                return feature
            } )
        } )
    }

} )
