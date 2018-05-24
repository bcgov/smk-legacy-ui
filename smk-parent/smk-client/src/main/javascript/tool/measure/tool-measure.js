include.module( 'tool-measure', [ 'tool', 'widgets', 'tool-measure.panel-measure-html' ], function ( inc ) {

    var metersPerUnit = {
        "Mil":              2.5399999999999996e-8,
        "MicroInch":        0.0000254,
        "mm":               0.001,
        "Millimeter":       0.001,
        "cm":               0.01,
        "Centimeter":       0.01,
        "IInch":            0.0254,
        "us-in":            0.0254000508001016,
        "Inch":             0.0254000508001016,
        "in":               0.0254000508001016,
        "inches":           0.0254000508001016,
        "Decimeter":        0.1,
        "ClarkeLink":       0.201166194976,
        "SearsLink":        0.2011676512155,
        "BenoitLink":       0.20116782494375873,
        "IntnlLink":        0.201168,
        "link":             0.201168,
        "GunterLink":       0.2011684023368047,
        "CapeFoot":         0.3047972615,
        "ClarkeFoot":       0.3047972651151,
        "ind-ft":           0.30479841,
        "IndianFt37":       0.30479841,
        "SearsFoot":        0.30479947153867626,
        "IndianFt75":       0.3047995,
        "IndianFoot":       0.30479951,
        "IndianFt62":       0.3047996,
        "GoldCoastFoot":    0.3047997101815088,
        "IFoot":            0.3048,
        "Foot":             0.3048006096012192,
        "ft":               0.3048006096012192,
        "us-ft":            0.3048006096012192,
        "ModAmFt":          0.304812252984506,
        "ind-yd":           0.9143952300000001,
        "IndianYd37":       0.9143952300000001,
        "SearsYard":        0.914398414616029,
        "IndianYd75":       0.9143985000000001,
        "IndianYard":       0.9143985307444409,
        "IndianYd62":       0.9143987999999998,
        "IYard":            0.9143999999999999,
        "Yard":             0.9144018288036576,
        "yd":               0.9144018288036576,
        "us-yd":            0.9144018288036576,
        "CaGrid":           0.9997380000000001,
        "m":                1,
        "Meter":            1,
        "GermanMeter":      1.0000135965,
        "fath":             1.8287999999999998,
        "Fathom":           1.8287999999999998,
        "Rood":             3.7782668980000005,
        "Perch":            5.02921005842012,
        "Rod":              5.02921005842012,
        "Pole":             5.02921005842012,
        "Dekameter":        10,
        "Decameter":        10,
        "ClarkeChain":      20.1166194976,
        "ind-ch":           20.11669506,
        "SearsChain":       20.11676512155,
        "BenoitChain":      20.116782494375872,
        "IntnlChain":       20.1168,
        "ch":               20.1168,
        "us-ch":            20.11684023368047,
        "GunterChain":      20.11684023368047,
        "dm":               100,
        "Hectometer":       100,
        "Furlong":          201.1684023368046,
        "Brealey":          375,
        "km":               1000,
        "Kilometer":        1000,
        "IMile":            1609.344,
        "Mile":             1609.3472186944373,
        "mi":               1609.3472186944373,
        "us-mi":            1609.3472186944373,
        "kmi":              1851.9999999999998,
        "nmi":              1851.9999999999998,
        "NautM":            1852.0000000000002,
        "NautM-UK":         1853.1840000000002,
        "50kilometers":     50000,
        "Lat-66":           110943.31648893275,
        "Lat-83":           110946.25736872235,
        "dd":               111118.97383794768,
        "degrees":          111118.97383794768,
        "150kilometers":    150000
    }

    Vue.component( 'measure-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'measure-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-measure.panel-measure-html' ],
        props: [ 'busy', 'results', 'viewer' ],
        data: function () {
            return {
                unit: 'metric'
            }
        }
    } )

    Vue.directive( 'container', {
        unbind: function ( el, binding, vnode ) {
            // console.log( 'unbind', arguments )
            vnode.context.$$emit( 'container-unbind', { el: el } )
        },

        inserted: function ( el, binding, vnode ) {
            vnode.context.$$emit( 'container-inserted', { el: el } )
            // console.log( 'inserted', arguments )
        },

        update: function ( el, binding ) {
            // console.log( 'update', arguments )
        }
    } )

    function formatNumber( value ) {
        var i = Math.floor( value ),
            f = value - i

        return i.toLocaleString() + f.toFixed( 2 ).substr( 1 )
    }

    Vue.filter( 'formatValue', function ( value, dim, unit ) {
        if ( dim == null ) return value

        switch ( dim + '-' + unit ) {
            case '1-metric':        return formatNumber( value ) + ' m'
            case '1-imperial':      return formatNumber( value / metersPerUnit[ 'mi' ] ) + ' mi'
            case '1-inches':        return formatNumber( value / metersPerUnit[ 'inches' ] ) + ' in'
            case '1-feet':          return formatNumber( value / metersPerUnit[ 'ft' ] ) + ' ft'
            case '1-yards':         return formatNumber( value / metersPerUnit[ 'yd' ] ) + ' yd'
            case '1-miles':         return formatNumber( value / metersPerUnit[ 'mi' ] ) + ' mi'
            case '1-nautical-miles':return formatNumber( value / metersPerUnit[ 'nmi' ] ) + ' nm'
            case '1-meters':        return formatNumber( value ) + ' m'
            case '1-kilometers':    return formatNumber( value / 1000 ) + ' km'
            case '1-acres':         return formatNumber( value / metersPerUnit[ 'mi' ] ) + ' mi'
            case '1-hectares':      return formatNumber( value ) + ' m'

            case '2-metric':        return formatNumber( value ) + ' m²'
            case '2-imperial':      return formatNumber( value / metersPerUnit[ 'mi' ] / metersPerUnit[ 'mi' ] ) + ' mi²'
            case '2-inches':        return formatNumber( value / metersPerUnit[ 'inches' ] / metersPerUnit[ 'inches' ] ) + ' in²'
            case '2-feet':          return formatNumber( value / metersPerUnit[ 'ft' ] / metersPerUnit[ 'ft' ] ) + ' ft²'
            case '2-yards':         return formatNumber( value / metersPerUnit[ 'yd' ] / metersPerUnit[ 'yd' ] ) + ' yd²'
            case '2-miles':         return formatNumber( value / metersPerUnit[ 'mi' ] / metersPerUnit[ 'mi' ] ) + ' mi²'
            case '2-nautical-miles':return formatNumber( value / metersPerUnit[ 'nmi' ] / metersPerUnit[ 'nmi' ] ) + ' nmi²'
            case '2-meters':        return formatNumber( value ) + ' m²'
            case '2-kilometers':    return formatNumber( value / 1000 / 1000 ) + ' km²'
            case '2-acres':         return formatNumber( value / metersPerUnit[ 'GunterChain' ] / metersPerUnit[ 'Furlong' ] ) + ' acres'
            case '2-hectares':      return formatNumber( value / 100 / 100 ) + ' ha'
        }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function MeasureTool( option ) {
        this.makePropWidget( 'icon', 'straighten' )
        this.makePropPanel( 'busy', false )
        this.makePropPanel( 'results', [] )
        this.makePropPanel( 'viewer', {} )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            order:          2,
            position:       'toolbar',
            title:          'Measurement',
            widgetComponent:'measure-widget',
            panelComponent: 'measure-panel',
        }, option ) )
    }

    SMK.TYPE.MeasureTool = MeasureTool

    $.extend( MeasureTool.prototype, SMK.TYPE.Tool.prototype )
    MeasureTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    MeasureTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.on( this.id, {
            'activate': function () {
                if ( !self.visible || !self.enabled ) return

                self.active = !self.active
            },

            // 'container-inserted': function ( ev ) {
            //     console.log( ev )

            // },

            // 'container-unbind': function ( ev ) {
            //     console.log( ev )

            // }
        } )
    } )

    return MeasureTool
} )

