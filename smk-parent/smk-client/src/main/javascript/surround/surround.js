include.module( 'surround', [ 'vue', 'surround.header-html' ], function ( inc ) {

    function Surround( smk ) {
        var self = this

        try { var url = smk.$viewer.resolveAttachmentUrl( smk.surround.imageSrc, null, 'png' ) } catch ( e ) {}

        this.vm = new Vue( {
            el:     smk.addToContainer( inc[ 'surround.header-html' ], { id: 'smk-header' }, true ),
            data: {
                imageUrl:   url,
                title:      smk.surround.title,
                subtitles:  smk.surround.subtitles,
            }
        } )

        $( 'head title' ).text( smk.surround.title )
    }

    SMK.TYPE.Surround = Surround

    return Surround

} )