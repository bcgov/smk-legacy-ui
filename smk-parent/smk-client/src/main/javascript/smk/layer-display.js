include.module( 'layer-display', [ 'jquery', 'util', 'event' ], function () {
    "use strict";

    function LayerDisplay( option, forceVisible ) {
        Object.assign( this, {
            id:         null,
            // opacity:    1,
            title:      null,
            isVisible:  true,
            isActuallyVisible: null,
            isEnabled:  true,
            inFilter:   true,
            showLegend: false,
            legends:    null
        }, option )

        if ( forceVisible )
            this.isVisible = true
    }

    SMK.TYPE.LayerDisplay = LayerDisplay
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.Layer = function ( option, layerCatalog, forceVisible ) {
        if ( !option.id )
            option.id = option.layerId

        if ( !( option.layerId in layerCatalog ) ) {
            console.warn( 'layer id "' + option.layerId + '" isn\'t defined' )
            option.isEnabled = false

            if ( !option.title )
                option.title = option.layerId

            option.isVisible = false
        }
        else {
            var ly = layerCatalog[ option.layerId ]

            // if ( !option.opacity )
            //     option.opacity = ly.config.opacity 

            if ( !option.title )
                option.title = ly.config.title 

            if ( !( 'isVisible' in option ) )
                option.isVisible = ly.config.isVisible 
        }

        LayerDisplay.prototype.constructor.call( this, option, forceVisible )
    }

    $.extend( LayerDisplay.Layer.prototype, LayerDisplay.prototype )

    LayerDisplay.Layer.prototype.each = function ( itemCb, folderCb, parents ) {
        if ( !this.isEnabled ) return

        if ( itemCb )
            itemCb( this, parents )
    }

    LayerDisplay.Layer.prototype.getLegends = function ( layerCatalog, viewer ) {
        if ( !this.isEnabled ) return SMK.UTIL.resolved()

        return layerCatalog[ this.layerId ].getLegends( viewer )
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplay.Folder = function ( option, layerCatalog, forceVisible ) {
        if ( !option.id )
            option.id = SMK.UTIL.makeId( option.folderId, option.title )

        if ( !option.title )
            option.title = option.folderId

        LayerDisplay.prototype.constructor.call( this, option, forceVisible )

        forceVisible = forceVisible || this.isGroup

        this.items = option.items.map( function ( item ) {
            return createLayerDisplay( item, layerCatalog, forceVisible )
        } )
    }

    $.extend( LayerDisplay.Folder.prototype, LayerDisplay.prototype )

    LayerDisplay.Folder.prototype.each = function ( itemCb, folderCb, parents ) {
        if ( !parents ) parents = []

        var recurse
        if ( folderCb )
            recurse = folderCb( this, parents )
        else if ( itemCb )
            recurse = itemCb( this, parents )

        var p = [ this ].concat( parents )

        if ( recurse !== false )        
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
        if ( !option.id )
            option.id = SMK.UTIL.makeId( option.groupId, option.title )

        if ( !option.title )
            option.title = option.groupId

        LayerDisplay.Folder.prototype.constructor.call( this, option, layerCatalog, forceVisible )
    }

    $.extend( LayerDisplay.Group.prototype, LayerDisplay.Folder.prototype )

    LayerDisplay.Group.prototype.getLegends = function ( layerCatalog, viewer ) {
        if ( !this.isEnabled ) return

        return SMK.UTIL.waitAll( this.items.map( function ( item ) {
            return item.getLegends( layerCatalog, viewer )
        } ) )
        .then ( function ( legends ) {
            return legends.reduce( function ( accum, v ) { return accum.concat( v ) }, [] )
        } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function createLayerDisplay( option, layerCatalog, forceVisible ) {
        if ( ( 'layerId' in option ) + ( 'folderId' in option ) + ( 'groupId' in option ) != 1 )
            throw new Error( 'layerDisplay must define exactly one of layerId, folderId, or groupId' )

        if ( 'layerId' in option )
            return new LayerDisplay.Layer( Object.assign( { isLayer: true }, option ), layerCatalog, forceVisible )
        else if ( 'folderId' in option )
            return new LayerDisplay.Folder( Object.assign( { isFolder: true }, option ), layerCatalog, forceVisible )
        else
            return new LayerDisplay.Group( Object.assign( { isGroup: true }, option ), layerCatalog, forceVisible )
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
            folderId:   'root', 
            isExpanded: true, 
            isVisible:  true,
            items:      items
        }, layerCatalog )

        this.itemId = {}
        this.layerIds = []

        var c = 1000
        this.root.each( 
            function ( item, parents ) {
                if ( item.id in self.itemId ) {
                    if ( item.isLayer ) {
                        console.warn( 'Layer "' + item.id + '" is duplicated in layer display' )
                        item.isEnabled = false
                    }
                    else {
                        console.warn( ( item.isFolder ? 'Folder "' : 'Group "' ) + item.id + '" is duplicated in layer display' )
                        while ( ( item.id + '=' + c ) in self.itemId ) c =+ 1
                        item.id = item.id + '=' + c
                    }
                }

                self.itemId[ item.id ] = [ item ].concat( parents )

                if ( item.isLayer )
                    self.layerIds.push( item.layerId )
            }
        )

        this.changedVisibility( function () {
            self.root.each( 
                function ( item, parents ) {
                    item.isActuallyVisible = self.isItemVisible( item.id )
                }
            )
        } )

        this.changedVisibility()
    }

    SMK.TYPE.LayerDisplayContext = LayerDisplayContext

    $.extend( LayerDisplayContext.prototype, LayerDisplayContextEvent.prototype )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    LayerDisplayContext.prototype.getLayerIds = function () {
        return this.layerIds
    }

    LayerDisplayContext.prototype.setFolderExpanded = function ( id, expanded ) {
        if ( !( id in this.itemId ) ) return 

        if ( this.itemId[ id ][ 0 ].isFolder )
            this.itemId[ id ][ 0 ].isExpanded = expanded
    }

    LayerDisplayContext.prototype.isItemVisible = function ( id ) {
        if ( !( id in this.itemId ) ) return false

        return this.itemId[ id ].reduce( function ( accum, ld ) {
            return accum && ld.isVisible
        }, true )
    }

    LayerDisplayContext.prototype.setItemVisible = function ( id, visible, deep ) {
        if ( !( id in this.itemId ) ) return 

        var lds = this.itemId[ id ]

        if ( visible )
            lds.forEach( function ( ld ) {
                ld.isVisible = true
            } )
        else
            lds[ 0 ].isVisible = false

        if ( deep ) {
            lds[ 0 ].each( function ( item ) {
                item.isVisible = visible
                if ( item.isGroup ) return false 
            } )
        }

        this.changedVisibility()        

        return visible
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
                            if ( item.showLegend == 'waiting' )
                                item.showLegend = true
                        }, function () {
                            item.legends = false
                            item.showLegend = false
                        } )
                }
                else {
                    item.showLegend = false
                }

                if ( item.isGroup ) return false 
            }
        )
    }

    LayerDisplayContext.prototype.setFilter = function ( regex ) {
        var self = this

        this.root.each( 
            function ( item ) {
                item.inFilter = false
                if ( regex.test( item.title ) )
                    self.itemId[ item.id ].forEach( function ( i ) {
                        i.inFilter = true 
                    } )

                if ( item.isGroup ) return false 
            }
        )
    }
} )