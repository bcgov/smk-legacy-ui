var fs = require( 'fs' )
var path = require('path')

var tag = JSON.parse( stripJsonComments( fs.readFileSync( 'smk-tags.json' ).toString() ) )
var tags = Object.keys( tag )

var basePath = '.'

var objs = []

function load( tag, inc ) {
    if ( typeof inc == 'string' ) return '"' + inc + '"'

    var def = loader[ inc.loader ]( tag, inc )
    if ( tag )
        return 'include.tag( "' + tag + '", ' + def + ' )\n'
    else 
        return def
}

var loader = {
    script: function ( tag, inc ) {
        var f = fs.readFileSync( path.join( basePath, inc.url ) )

        return '{ loader: "script", load: function () {\n' + f + '\n} }'
    },
    style: function ( tag, inc ) {
        var f = fs.readFileSync( path.join( basePath, inc.url ) )

        return '{ loader: "style", load:\n' + JSON.stringify( f.toString() ) + '\n}'
    },
    template: function ( tag, inc ) {
        var f = fs.readFileSync( path.join( basePath, inc.url ) )

        return '{ loader: "template", load:\n' + JSON.stringify( f.toString() ) + '\n}'
    },
    group: function ( tag, inc ) {
        var g = inc.tags.map( function ( inc ) { return load( null, inc ) } ).join( ',\n  ' )

        return '{ loader: "group", tags: [\n  ' + g + '\n] }'
    },
    sequence: function ( tag, inc ) {
        var g = inc.tags.map( function ( inc ) { return load( null, inc ) } ).join( ',\n  ' )

        return '{ loader: "group", tags: [\n  ' + g + '\n] }'
    }
}

objs.push(  'document={location:"."}' )
objs.push(  'window=global' )
objs.push(  '//include.js' )
objs.push(  fs.readFileSync( 'include.js' ) )
tags.forEach( function ( t ) {
    // console.log( t )

    var inc = tag[ t ]
    try {    
        objs.push(  '//'+t )
        objs.push( load( t, inc ) )
    } 
    catch (e) {
        console.log( t, e )
    }
} )
objs.push(  '//smk-bootstrap.js' )
objs.push(  fs.readFileSync( 'smk-bootstrap.js' ) )

// var js = '{\n' + objs.join( ', ' ) + '\n}'
var js = objs.join( '\n' ) 

process.stdout.write( js )
// eval( js )
// console.log( ejs )

// assumes is valid json data with single line comments added
function stripJsonComments( json ) {
    // console.log( typeof json )
    var strippedLines = json.replace( /^\s*[/][/].*$/gm, '' ).split( '\n' );

    for ( var i in strippedLines ) {
        var pieces = strippedLines[ i ].split( /[/][/]/g )

        // no trailing comments
        if ( pieces.length < 2 ) continue;

        // 2 pieces and no quotes in 2nd piece
        if ( pieces.length == 2 && ( !pieces[ 1 ] || !/"/.test( pieces[ 1 ] ) ) ) {
            strippedLines[ i ] = pieces[ 0 ]
            continue;
        }

        // more than 2 pieces, and no quotes in first piece
        if ( pieces.length > 2 && ( !/"/.test( pieces[ 0 ] ) ) ) {
            strippedLines[ i ] = pieces[ 0 ]
            continue;
        }

        // console.log( pieces )

        // gather pieces until the quotes balance
        var j = 1, out = pieces[ 0 ];
        while ( j < pieces.length ) {
            // find all quotes, with their prefixes
            var quotes = out.match( /[^"]*"/g )

            // count quotes than haven't been escaped
            var unescaped = 0;
            for ( var k = 0; k < quotes.length; k++ ) {
                if ( /([^\\]|^)([\\][\\])*.$/.test( quotes[ k ] ) ) {
                    // console.log( quotes[ k ] )
                    unescaped += 1;
                }
            }
            // console.log( '==+', out, quotes, unescaped )

            // a even number of unescaped quotes means that we've got a balanced piece
            if ( ( unescaped & 1 ) == 0 ) break;

            // accumulate next piece
            out += '//' + pieces[ j ]
            j += 1;
        }
        // console.log( '==', out )

        strippedLines[ i ] = out;
    }
    return strippedLines.join( '\n' )
}
