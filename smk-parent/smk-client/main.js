include( 'jquery', 'smk' ).then( function ( inc ) {
    // inc.smk.MODULE.jQuery = $;
    include.tag( 'jquery' ).exported = $
} )

include( 'vue', 'smk' ).then( function ( inc ) {
    // inc.smk.MODULE.Vue = Vue;
    include.tag( 'vue' ).exported = Vue

    // may not be a good idea
    Vue.mixin( {
        methods: {
            $$emit: function ( event, arg ) {
                this.$root.$emit( this.$options._componentTag + '.' + event, arg )
            }
        }
    } )
} )

include.module( '$main', [ 'smk', 'smk-map' ], function ( inc ) {

    return ( inc.smk.MAP[ this.arg.containerId ] = new inc.smk.TYPE.SmkMap( {
        containerId:    this.arg.containerId,
        config:         this.arg.config,
        configUrls:     this.arg.configUrls,
        standalone:     this.arg.standalone
    } ) ).initialize()

} )

