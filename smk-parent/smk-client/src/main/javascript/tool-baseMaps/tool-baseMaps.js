include.module( 'tool-baseMaps', [ 'smk', 'tool', 'widgets', 'tool-baseMaps.panel-base-maps-html' ], function ( inc ) {

    var baseMapTitle = {
        Topographic: 'Topographic',
        Streets: 'Streets',
        Imagery: 'Imagery',
        Oceans: 'Oceans',
        NationalGeographic: 'National Geographic',
        DarkGray: 'Dark Gray',
        Gray: 'Gray',
    }

    Vue.component( 'baseMaps-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'baseMaps-panel', {
        template: inc[ 'tool-baseMaps.panel-base-maps-html' ],
        props: [ 'tool' ]
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
        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:      3,
            title:      'Base Maps',
            center:     null,
            zoom:       null,
            current:    null,
            basemaps:   [],
            widget:     { icon: 'map', component: 'baseMaps-widget' },
            panel:      { component: 'baseMaps-panel' },
        }, option ) )
    }

    SMK.TYPE.BaseMapsTool = BaseMapsTool

    $.extend( BaseMapsTool.prototype, SMK.TYPE.Tool.prototype )

    BaseMapsTool.prototype.getPanel = function () {
        var self = this
        return Object.assign( SMK.TYPE.Tool.prototype.getPanel(), {
            get basemaps() { return self.basemaps },
            get center() { return self.center },
            get zoom() { return self.zoom },
            get current() { return self.current }
        } )
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    BaseMapsTool.prototype.afterInitialize = function ( smk, aux ) {
        var self = this

        var choices = [ 'Topographic', 'Streets', 'Imagery', 'Oceans', 'NationalGeographic', 'DarkGray', 'Gray' ]
        if ( this.choices && this.choices.length > 0 )
            choices = this.choices

        if ( !choices.includes( smk.viewer.baseMap ) )
            choices.unshift( smk.viewer.baseMap )

        this.current = smk.viewer.baseMap

        this.basemaps = choices.map( function ( c ) {
            return {
                id: c,
                title: baseMapTitle[ c ]
            }
        } )

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
        self.center = v.center
        self.zoom = v.zoom

        aux.toolbar.vm.$on( 'baseMaps-widget.click', function () {
            if ( !self.visible || !self.enabled ) return

            self.active = !self.active
            // self.title = self.title + 'xxx'
            // console.log( arguments )
        } )

    }

    return BaseMapsTool

} )
