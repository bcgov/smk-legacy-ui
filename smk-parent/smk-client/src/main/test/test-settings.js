$( function () {
    window.PARAM = {}
    $.each( location.search.substr( 1 ).split( '&' ), function ( i, p ) {
        var m = p.match( /(.+?)=(.*)/ );
        if ( !m ) return;
        if ( m[ 1 ] in PARAM )
            PARAM[ m[ 1 ] ] = [].concat( PARAM[ m[ 1 ] ], m[ 2 ] )
        else
            PARAM[ m[ 1 ] ] = m[ 2 ]
    } )
    console.log( PARAM )

    $( '#apply' ).click( function () {
        document.location.search = $( '#config' ).serialize()
    } )

    $( '#config' ).chosen( {
        no_results_text: "Nothing selected"
    } )
    .change( function ( ev ) {
        $( '#tools' ).show()
    } )
    .val( PARAM.config )
    .trigger( 'chosen:updated' )
} )
