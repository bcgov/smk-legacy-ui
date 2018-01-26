include.module( 'smk', null, function () {

    if ( !window.SMK )
        window.SMK = {
            MAP: {},
            VIEWER: {},
            MODULE: {},
            TYPE: {},
            UTIL: {}
        }

    return window.SMK

} )