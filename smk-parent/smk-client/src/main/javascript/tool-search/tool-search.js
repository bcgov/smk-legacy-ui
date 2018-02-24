include.module( 'tool-search', [ 'smk', 'tool', 'widgets', 'tool-search.widget-search-html', 'tool-search.panel-search-html' ], function ( inc ) {

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

    Vue.component( 'search-widget', {
        template: inc[ 'tool-search.widget-search-html' ],
        props: [ 'tool' ],
        data: function () {
            return {
                search: null
            }
        }
    } )

    Vue.component( 'search-panel', {
        template: inc[ 'tool-search.panel-search-html' ],
        // props: [ 'results', 'busy', 'highlightId' ],
        props: [ 'tool' ],
        methods: {
            isEmpty: function () {
                return !this.tool.results || this.tool.results.length == 0
            }
        },
        data: function () {
            return {
                search: null
            }
        }
    } )

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function SearchTool( option ) {
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:      2,
            title:      'Search',
            widget:     { icon: 'search', component: 'search-widget' },
            panel:      { component: 'search-panel' },
            results:    [],
            busy:       false,
            highlightId: null,
            panelProperties: SMK.TYPE.Tool.prototype.panelProperties.concat( 'results', 'busy', 'highlightId' )
        }, option ) )
    }

    SMK.TYPE.SearchTool = SearchTool

    $.extend( SearchTool.prototype, SMK.TYPE.Tool.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SearchTool.prototype.afterInitialize = function ( smk, aux ) {
        var self = this

        // aux.toolbar.vm.$on( 'search-widget.click', function () {
        //     if ( !self.isVisible() || !self.isEnabled() ) return

        //     self.active( !self.isActivated() )
        //     // console.log( arguments )
        // } )

        // var sb = smk.getSidebar()

        // var model = sb.addPanel( 'search', {
            // button: { title: 'Search', icon: 'search' },
            // panel: {
                // busy: false,
                // results: [],
                // highlightId: null
            // }
        // } )

        aux.toolbar.vm.$on( 'search-widget.input-change', function ( ev ) {
            smk.$viewer.searched.clear()

            self.busy = true
            doAddressSearch( ev.text )
                .then( function ( features ) {
                    self.active( true )
                    smk.$viewer.searched.add( 'search', features, 'fullAddress' )
                    self.busy = false
                } )
                .catch( function ( e ) {
                    console.warn( e )
                } )
        } )

        aux.panel.vm.$on( 'search-panel.hover', function ( ev ) {
            smk.$viewer.searched.highlight( ev.result ? [ ev.result.id ] : [] )
        } )

        aux.panel.vm.$on( 'search-panel.pick', function ( ev ) {
            smk.$viewer.searched.pick( ev.result.id )
        } )

        aux.panel.vm.$on( 'search-panel.clear', function ( ev ) {
            smk.$viewer.searched.clear()
        } )


        smk.$viewer.searched.addedFeatures( function ( ev ) {
            self.results = ev.features
        } )

        // // smk.$viewer.selected.removedFeatures( function ( ev ) {
        // // } )

        smk.$viewer.searched.pickedFeature( function ( ev ) {
            self.highlightId = ev.feature && ev.feature.id
        } )

        // // smk.$viewer.selected.highlightedFeatures( function ( ev ) {
        // // } )

        smk.$viewer.searched.clearedFeatures( function ( ev ) {
            self.results = []
        } )


    }

    return SearchTool

} )

