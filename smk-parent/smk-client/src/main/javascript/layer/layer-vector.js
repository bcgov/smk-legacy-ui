include.module( 'layer.layer-vector-js', [ 'layer' ], function () {

    function VectorLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply( this, arguments )
    }

    $.extend( VectorLayer.prototype, SMK.TYPE.Layer.prototype )

    SMK.TYPE.Layer[ 'vector' ] = VectorLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    VectorLayer.prototype.getLegends = function createLegendChip( width, height ) {
        if ( width == null ) width = 20
        if ( height == null ) height = 20

        var cv = $( '<canvas width="' + width + '" height="' + height + '">' ).get( 0 )
        var ctx = cv.getContext( '2d' )

        ctx.fillStyle = this.config.style.fillColor
        ctx.fillRect( 0, 0, width, height )

        ctx.lineWidth = this.config.style.strokeWidth
        ctx.strokeStyle = this.config.style.strokeColor
        ctx.strokeRect( 0, 0, width, height )

        return SMK.UTIL.resolved( [ {
            url: cv.toDataURL( 'image/png' ),
        } ] )
    }

    VectorLayer.prototype.initialize = function () {
        if ( this.hasChildren() )
            this.isContainer = true

        Layer.prototype.initialize.apply( this, arguments )

        if ( this.config.useHeatmap )
            this.config.isQueryable = false
    }

    VectorLayer.prototype.hasChildren = function () {
        return ( this.config.useRaw + this.config.useClustering + this.config.useHeatmap ) > 1
    }

    VectorLayer.prototype.childLayerConfigs = function () {
        configs = []

        if ( this.config.useClustering )
            configs.push( Object.assign( {}, this.config, {
                id: 'clustered',
                dataUrl: '@' + this.config.id,
                title: 'Clustered',
                useRaw: false,
                useHeatmap: false,
            } ) )

        if ( this.config.useHeatmap )
            configs.push( Object.assign( {}, this.config, {
                id: 'heatmap',
                dataUrl: '@' + this.config.id,
                title: 'Heatmap',
                useRaw: false,
                useClustering: false,
            } ) )

        if ( this.config.useRaw )
            configs.push( Object.assign( {}, this.config, {
                id: 'raw',
                dataUrl: '@' + this.config.id,
                title: 'Raw',
                useHeatmap: false,
                useClustering: false,
            } ) )

        return configs
    }

} )
