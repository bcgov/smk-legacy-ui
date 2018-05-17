function arg( key, value ) {
    return new Argument( key, value )
}

function parseArg( arg ) {
}

function Argument( key, value ) {
    this.key = key
    this.value = value
}

Argument.prototype.toParam = function () {
    return this.key + '=' + this.value
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var data = {
    urls: [
        '?viewer=esri3d&hide-tool=all&show-tool=pan,zoom&config=./config/fish-points.json'        
    ],
    availablePages: [
        'standalone'
    ],
    currentArgs: [],
    availableArgs: [
        arg( 'viewer', 'esri3d' ),
        arg( 'hide-tool', 'all' ),
        arg( 'show-tool', 'pan,zoom' ),
        arg( 'config', './config/fish-points.json' ),
    ],
}

var vm = new Vue( {
    el: '#launcher',
    data: data
} )