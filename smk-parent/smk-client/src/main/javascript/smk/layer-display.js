include.module( 'layer-display', [ 'jquery', 'util', 'event' ], function () {
    "use strict";

    function LayerDisplay( option, forceVisible ) {
        Object.assign( this, {
            id:         null,
            opacity:    1,
            title:      null,
            isVisible:  true
        }, option )

        if ( forceVisible )
            this.isVisible = true
    }

    SMK.TYPE.LayerDisplay = LayerDisplay
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.Layer = function ( option, layerCatalog, forceVisible ) {
        if ( !( option.layerId in layerCatalog ) )
            throw new Error( 'layer id "' + option.layerId + '" isn\'t defined' )

        var ly = layerCatalog[ option.layerId ]

        if ( !option.id )
            option.id = option.layerId

        if ( !option.opacity )
            option.opacity = ly.config.opacity 

        if ( !option.title )
            option.title = ly.config.title 

        if ( !( 'isVisible' in option ) )
            option.isVisible = ly.config.isVisible 
        
        LayerDisplay.prototype.constructor.call( this, option, forceVisible )
    }

    $.extend( LayerDisplay.Layer.prototype, LayerDisplay.prototype )

    LayerDisplay.Layer.prototype.each = function ( itemCb, folderCb, parents ) {
        if ( itemCb )
            itemCb( this, parents )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.Folder = function ( option, layerCatalog, forceVisible ) {
        if ( !option.id )
            throw new Error( 'need id' )

        if ( !option.title )
            throw new Error( 'need title' )

        LayerDisplay.prototype.constructor.call( this, Object.assign( {
            isExpanded: null
        }, option ), forceVisible )

        forceVisible = forceVisible || this.isExpanded == null

        this.items = option.items.map( function ( item ) {
            return createLayerDisplay( item, layerCatalog, forceVisible )
        } )
    }

    $.extend( LayerDisplay.Folder.prototype, LayerDisplay.prototype )

    LayerDisplay.Folder.prototype.each = function ( itemCb, folderCb, parents ) {
        if ( !parents ) parents = []

        if ( folderCb )
            folderCb( this, parents )

        var p = [ this ].concat( parents )
        
        this.items.forEach( function ( item ) {
            item.each( itemCb, folderCb, p )
        } )
    }

    LayerDisplay.Folder.prototype.areAllItemsVisible = function () {
        var vc = this.items.reduce( function ( accum, item ) {
            return accum + ( item.isVisible ? 1 : 0 )
        }, 0 )
// console.log( this.id, vc)
        return vc == 0 ? false : vc == this.items.length ? true : null
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function createLayerDisplay( layerDisplay, layerCatalog, forceVisible ) {
        if ( 'layerId' in layerDisplay && 'items' in layerDisplay )
            throw new Error( 'layerDisplay can\'t define both layerId and items' )

        if ( !( 'layerId' in layerDisplay ) && !( 'items' in layerDisplay ) )
            throw new Error( 'layerDisplay must define one of layerId or items' )

        if ( 'layerId' in layerDisplay )
            return new LayerDisplay.Layer( layerDisplay, layerCatalog, forceVisible )
        else
            return new LayerDisplay.Folder( layerDisplay, layerCatalog, forceVisible )
    } 
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    var LayerDisplayContextEvent = SMK.TYPE.Event.define( [
        'changedVisibility'
    ] )

    function LayerDisplayContext( items, layerCatalog ) {
        LayerDisplayContextEvent.prototype.constructor.call( this )

        this.root = createLayerDisplay( { 
            id: '$root', 
            title: '(Root)', 
            isExpanded: true, 
            isVisible: true,
            items: items
        }, layerCatalog )

        var id = this.layerId = {}
        var ids = this.layerIds = []
        var folderId = this.folderId = {}

        this.root.each( 
            function ( item, parents ) {
                if ( item.layerId in id )
                    throw new Error( item.layerId + ' is duplicated in layer display' )

                id[ item.layerId ] = [ item ].concat( parents )
                ids.push( item.layerId )
            }, 
            function ( folder, parents ) {
                var fId = parents.reduceRight( function ( a, v ) { return a + v.id + '--' }, '' ) + folder.id                
                if ( fId in folderId )
                    throw new Error( 'folder id ' + fId + ' is duplicated in layer display' )

                folder.id = fId
                folderId[ fId ] = folder 
            } 
        )
    }

    SMK.TYPE.LayerDisplayContext = LayerDisplayContext

    $.extend( LayerDisplayContext.prototype, LayerDisplayContextEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplayContext.prototype.setFolderExpanded = function ( folderId, expanded ) {
        if ( !( folderId in this.folderId ) )
            throw new Error( 'folder ' + folderId + ' not defined' )

        if ( this.folderId[ folderId ].isExpanded == null ) return

        this.folderId[ folderId ].isExpanded = expanded
    }

    LayerDisplayContext.prototype.setFolderVisible = function ( folderId, visible ) {
        if ( !( folderId in this.folderId ) )
            throw new Error( 'folder ' + folderId + ' not defined' )

        this.folderId[ folderId ].isVisible = visible

        this.changedVisibility()        
    }

    LayerDisplayContext.prototype.isLayerVisible = function ( layerId ) {
        if ( !( layerId in this.layerId ) ) return false

        return this.layerId[ layerId ].reduce( function ( accum, ld ) {
            return accum && ld.isVisible
        }, true )
    }

    LayerDisplayContext.prototype.setLayerVisible = function ( layerId, visible ) {
        if ( !( layerId in this.layerId ) ) return 
        // if ( this.isLayerVisible( layerId ) == !!visible ) return 

        var lds = this.layerId[ layerId ]

        if ( visible )
            lds.forEach( function ( ld ) {
                ld.isVisible = true
            } )
        else
            lds[ 0 ].isVisible = false

        this.changedVisibility()        

        return visible
    }

    LayerDisplayContext.prototype.areAllLayersVisible = function () {
        var self = this

        var vc = this.layerIds.reduce( function ( accum, id ) {
            return accum + ( self.isLayerVisible( id ) ? 1 : 0 )
        }, 0 )

        return vc == 0 ? false : vc == this.layerIds.length ? true : null
    }

} )