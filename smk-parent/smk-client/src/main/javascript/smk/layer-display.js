include.module( 'layer-display', [ 'jquery', 'util', 'event' ], function () {
    "use strict";

    function LayerDisplay( option, forceVisible ) {
        Object.assign( this, {
            id:         null,
            opacity:    1,
            title:      null,
            isVisible:  true,
            isActuallyVisible: null,
            showLegend: false,
            legends:   null
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

    LayerDisplay.Layer.prototype.getLegends = function ( layerCatalog, viewer ) {
        return layerCatalog[ this.layerId ].getLegends( viewer )
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.Folder = function ( option, layerCatalog, forceVisible ) {
        if ( !option.id )
            throw new Error( 'need id' )

        if ( !option.title )
            throw new Error( 'need title' )

        LayerDisplay.prototype.constructor.call( this, option, forceVisible )

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
        else if ( itemCb )
            itemCb( this, parents )

        var p = [ this ].concat( parents )
        
        this.items.forEach( function ( item ) {
            item.each( itemCb, folderCb, p )
        } )
    }

    LayerDisplay.Folder.prototype.getLegends = function ( layerCatalog, viewer ) {
        return SMK.UTIL.resolved()
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.Group = function ( option, layerCatalog, forceVisible ) {
        LayerDisplay.Folder.prototype.constructor.call( this, option, layerCatalog, forceVisible )
    }

    $.extend( LayerDisplay.Group.prototype, LayerDisplay.Folder.prototype )

    LayerDisplay.Group.prototype.getLegends = function ( layerCatalog, viewer ) {
        return SMK.UTIL.waitAll( this.items.map( function ( item ) {
            return item.getLegends( layerCatalog, viewer )
        } ) )
        .then ( function ( legends ) {
            return legends.reduce( function ( accum, v ) { return accum.concat( v ) }, [] )
        } )
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
        else if ( layerDisplay.isExpanded != null )
            return new LayerDisplay.Folder( layerDisplay, layerCatalog, forceVisible )
        else
            return new LayerDisplay.Group( layerDisplay, layerCatalog, forceVisible )
    } 
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    var LayerDisplayContextEvent = SMK.TYPE.Event.define( [
        'changedVisibility'
    ] )

    function LayerDisplayContext( items, layerCatalog ) {
        var self = this

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

        this.root.each( 
            function ( item, parents ) {
                if ( item.layerId in id )
                    throw new Error( item.layerId + ' is duplicated in layer display' )

                id[ item.layerId ] = [ item ].concat( parents )
                ids.push( item.layerId )
            }, 
            function ( folder, parents ) {
                folder.folderId = parents.slice( 0, parents.length - 1 ).reduceRight( function ( a, v ) { return a + v.id + '--' }, '' ) + folder.id

                if ( folder.folderId in id )
                    throw new Error( 'folder id ' + folder.folderId + ' is duplicated in layer display' )

                id[ folder.folderId ] = [ folder ].concat( parents )
            } 
        )

        this.changedVisibility( function () {
            self.root.each( 
                function ( item, parents ) {
                    item.isActuallyVisible = self.isItemVisible( item.layerId || item.folderId )
                }
            )
        } )

        this.changedVisibility()
    }

    SMK.TYPE.LayerDisplayContext = LayerDisplayContext

    $.extend( LayerDisplayContext.prototype, LayerDisplayContextEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplayContext.prototype.setFolderExpanded = function ( folderId, expanded ) {
        if ( !( folderId in this.layerId ) )
            throw new Error( 'folder ' + folderId + ' not defined' )

        if ( this.layerId[ folderId ][ 0 ].isExpanded == null ) return

        this.layerId[ folderId ][ 0 ].isExpanded = expanded
    }

    LayerDisplayContext.prototype.isItemVisible = function ( layerId ) {
        if ( !( layerId in this.layerId ) ) return false

        return this.layerId[ layerId ].reduce( function ( accum, ld ) {
            return accum && ld.isVisible
        }, true )
    }

    LayerDisplayContext.prototype.setItemVisible = function ( layerId, visible ) {
        if ( !( layerId in this.layerId ) ) return 

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
            return accum + ( self.isItemVisible( id ) ? 1 : 0 )
        }, 0 )

        return vc == 0 ? false : vc == this.layerIds.length ? true : null
    }

    LayerDisplayContext.prototype.setLegendsVisible = function ( visible, layerCatalog, viewer ) {
        this.root.each( 
            function ( item, parents ) {
                if ( visible ) {
                    if ( item.legends === false ) return
                    if ( item.showLegend == 'waiting' ) return
                    if ( item.legends ) {
                        item.showLegend = true
                        return
                    }

                    item.showLegend = 'waiting'
                    item.getLegends( layerCatalog, viewer )
                        .then( function ( ls ) {
                            item.legends = ls
                            item.showLegend = true
                        }, function () {
                            item.legends = false
                            item.showLegend = false
                        } )
                }
                else {
                    item.showLegend = false
                }
            }
        )
    }

} )