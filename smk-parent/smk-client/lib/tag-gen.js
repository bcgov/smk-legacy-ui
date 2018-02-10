var fs = require( 'fs' )
var path = require('path')
var glob = require('glob')

var ts =  function () {}
exports.TagSet = ts

ts.prototype._add = function ( tag, loader, url, option ) {
    if ( tag in this )
        throw new Error( 'tag "' + tag + '" already defined as ' + JSON.stringify( this[ tag ] ) )

    this[ tag ] = option || {}
    if ( url ) this[ tag ].url = url
    if ( loader ) this[ tag ].loader = loader

    return this[ tag ]
}

ts.prototype.script = function ( tag, url, option ) {
    this._add( tag, 'script', url, option )
}

ts.prototype.style = function ( tag, url, option ) {
    this._add( tag, 'style', url, option )
}

ts.prototype.template = function ( tag, url, option ) {
    this._add( tag, 'template', url, option )
}

ts.prototype.group = function ( tag, option ) {
    return this._add( tag, 'group', null, option ).tags = new tl()
}

ts.prototype.sequence = function ( tag, option ) {
    return this._add( tag, 'sequence', null, option ).tags = new tl()
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var tl = function () {
    var ar = []
    ar.__proto__ = tl.prototype
    return ar
}
exports.TagList = tl

tl.prototype = new Array

tl.prototype.tag = function ( tag ) {
    this.push( tag  )
    return this
}

tl.prototype.script = function ( url, option ) {
    this.push( Object.assign( option || {}, { url: url, loader: 'script' } ) )
    return this
}

tl.prototype.style = function ( url, option ) {
    this.push( Object.assign( option || {}, { url: url, loader: 'style' } ) )
    return this
}

tl.prototype.template = function ( url, option ) {
    this.push( Object.assign( option || {}, { url: url, loader: 'template' } ) )
    return this
}

var extTemplate = {
    js: 'script',
    css: 'style',
    html: 'template'
}

tl.prototype.dir = function ( pattern, option ) {
    var self = this

    glob( pattern, option, function ( err, files ) {
        files.forEach( function ( f ) {
            var ext = path.extname( f )
            // var url = path.join( dir, f )

            var loader = extTemplate[ ext ]
            if ( loader )
                self.push( { url: f, loader: loader } )
        } )
    } )
    // var files = fs.readdirSync( dir )


    return this
}
