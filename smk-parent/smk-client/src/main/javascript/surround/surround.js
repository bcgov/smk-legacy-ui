include.module( 'surround', [ 'vue', 'surround.header-html' ], function ( inc ) {

    function Surround( smk ) {
        var self = this

        var el = smk.addToContainer( inc[ 'surround.header-html' ], { id: 'smk-header' }, true )

        this.vm = new Vue( {
            el: el,
            data: Object.assign( {
                lmfId: smk.lmfId,
                imageSrc: null,
                title: null,
                subtitles: null,
            }, smk.surround ),
            methods: {
                url: function ( url ) {
                    return "url( '" + url + "')"
                }
            }
        } )
    }

    SMK.TYPE.Surround = Surround

    return Surround

} )