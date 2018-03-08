include.module( 'tool-baseMaps', [ 'smk', 'tool', 'widgets', 'viewer', 'leaflet', 'tool-baseMaps.panel-base-maps-html' ], function ( inc ) {
// include.module( 'tool-baseMaps', [ 'smk', 'tool', 'widgets', 'viewer', 'tool-baseMaps.panel-base-maps-html' ], function ( inc ) {

    Vue.component( 'baseMaps-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'baseMaps-panel', {
        template: inc[ 'tool-baseMaps.panel-base-maps-html' ],
        props: [ 'center', 'zoom', 'current', 'basemaps', ]
    } )

    // leaflet specific
    Vue.directive( 'map', {
        unbind: function ( el, binding ) {
            // console.log( 'unbind', binding )
            binding.value.basemap.map.remove()
        },

        inserted: function ( el, binding ) {
            // console.log( 'inserted', binding )

            var map = L.map( el, {
                attributionControl: false,
                zoomControl: false,
                dragging: false,
                keyboard: false,
                scrollWheelZoom: false,
                zoom: 10
            } );

            binding.value.basemap.map = map

            map.addLayer( L.esri.basemapLayer( binding.value.basemap.id, { detectRetina: true } ) )

            if ( binding.value.center ) {
                map.setView( binding.value.center, binding.value.zoom )
            }

            map.invalidateSize()
        },

        update: function ( el, binding ) {
            // console.log( 'update', binding )

            var map = binding.value.basemap.map

            if ( binding.value.center ) {
                map.setView( binding.value.center, binding.value.zoom )
                map.invalidateSize();
            }
        }
    } )

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function BaseMapsTool( option ) {
        this.makePropWidget( 'icon', 'map' )
        this.makePropPanel( 'center', null )
        this.makePropPanel( 'zoom', null )
        this.makePropPanel( 'current', null )
        this.makePropPanel( 'basemaps', [] )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          3,
            position:       'menu',
            title:          'Base Maps',
            widgetComponent:'baseMaps-widget',
            panelComponent: 'baseMaps-panel',
        }, option ) )
    }

    SMK.TYPE.BaseMapsTool = BaseMapsTool

    $.extend( BaseMapsTool.prototype, SMK.TYPE.Tool.prototype )
    BaseMapsTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    BaseMapsTool.prototype.afterInitialize.push( function ( smk, aux ) {
        var self = this

        this.basemaps = Object.keys( smk.$viewer.basemap )
            .map( function ( id ) {
                return Object.assign( { id: id }, smk.$viewer.basemap[ id ] )
            } )
            .filter( function ( bm ) {
                if ( !this.choices || this.choices.length == 0 ) return true
                if ( this.choices.indexOf( bm.id ) > -1 ) return true
                if ( smk.viewer.baseMap == bm.id ) return true

                return false
            } )
            .sort( function ( a, b ) { return a.order - b.order } )

        this.current = smk.viewer.baseMap

        aux.panel.vm.$on( 'baseMaps-panel.set-base-map', function ( ev ) {
            smk.$viewer.setBasemap( ev.id )
        } )

        smk.$viewer.changedBaseMap( function ( ev ) {
            self.current = ev.baseMap
        } )

        smk.$viewer.changedView( function ( ev ) {
            self.center = ev.center
            self.zoom = ev.zoom
        } )

        var v = smk.$viewer.getView()
        if ( v ) {
            self.center = v.center
            self.zoom = v.zoom
        }

        aux.widget.vm.$on( 'baseMaps-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
        } )
    } )

    return BaseMapsTool

} )