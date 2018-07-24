include.module( 'layer-display', [ 'jquery', 'util', 'event' ], function () {
    "use strict";

    // var LayerDisplayEvent = SMK.TYPE.Event.define( [
    // ] )

    function LayerDisplay( option ) {
        // LayerDisplayEvent.prototype.constructor.call( this )

        Object.assign( this, {
            id:         null,
            opacity:    1,
            title:      null,
            isVisible:  false
        }, option )
    }

    SMK.TYPE.LayerDisplay = LayerDisplay

    // $.extend( LayerDisplay.prototype, LayerDisplayEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.Item = function ( option, viewer ) {
        if ( !( option.layerId in viewer.layerId ) )
            throw new Error( 'layer id "' + option.layerId + '" isn\'t defined' )

        var ly = viewer.layerId[ option.layerId ]

        if ( !option.id )
            option.id = option.layerId

        if ( !option.opacity )
            option.opacity = ly.config.opacity 

        if ( !option.title )
            option.title = ly.config.title 

        if ( !( 'isVisible' in option ) )
            option.isVisible = ly.config.isVisible 
        
        LayerDisplay.prototype.constructor.call( this, option )
    }

    $.extend( LayerDisplay.Item.prototype, LayerDisplay.prototype )

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.List = function ( option, viewer ) {

        if ( !option.id )
            throw new Error( 'need id' )

        if ( !option.title )
            throw new Error( 'need title' )

        option.layerList = option.layerList.map( function ( item ) {
            return LayerDisplay.create( item, viewer )
        } )

        LayerDisplay.prototype.constructor.call( this, Object.assign( {
            isExpanded: null
        }, option ) )
    }

    $.extend( LayerDisplay.List.prototype, LayerDisplay.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.create = function ( layerDisplay, viewer ) {
        if ( 'layerId' in layerDisplay && 'layerList' in layerDisplay )
            throw new Error( 'layerDisplay can\'t define both layerId and layerList' )

        if ( !( 'layerId' in layerDisplay ) && !( 'layerList' in layerDisplay ) )
            throw new Error( 'layerDisplay must define one of layerId or layerList' )

        if ( 'layerId' in layerDisplay )
            return new LayerDisplay.Item( layerDisplay, viewer )
        else
            return new LayerDisplay.List( layerDisplay, viewer )
    } 

} )