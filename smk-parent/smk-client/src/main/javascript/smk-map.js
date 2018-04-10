include.module( 'smk-map', [ 'smk', 'jquery', 'util', 'viewer', 'layer' ], function () {

    function SmkMap( option ) {
        this.$option = option

        this.$option.container = $( '#' + this.$option.containerId ).get( 0 )
        if ( !this.$option.container )
            throw new Error( 'Unable to find container #' + this.$option.containerId )

        this.dispatcher = new Vue()
    }

    SMK.TYPE.SmkMap = SmkMap

    SmkMap.prototype.initialize = function () {
        var self = this;

        console.log( 'smk initialize:', this.$option )

        $( this.$option.container )
            .addClass( 'smk-hidden' )

        return loadConfigs()
            .then( parseConfigs )
            .then( initMapFrame )
            .then( initSurround )
            .then( showMap )
            .then( loadViewer )
            .then( loadTools )
            .then( initViewer )
            .then( initTools )
            .catch( function ( e ) {
                console.error( 'smk viewer #' + self.$option.containerId + ' failed to initialize:', e )
                window.alert( 'smk viewer #' + self.$option.containerId + ' failed to initialize' )
            } )

        function loadConfigs() {
            var tags = self.$option.configUrls.map( function ( url ) {
                var tag = 'config-' + url
                include.tag( tag, { loader: 'template', url: './' + url } )
                return tag
            } )

            return include( tags ).then( function ( inc ) {
                var configs = []
                tags.forEach( function ( tag ) {
                    configs.push( inc[ tag ] )
                } )

                if ( self.$option.config )
                    configs.push( self.$option.config )

                if ( configs.length == 0 )
                    return SMK.UTIL.rejected( new Error( 'no config provided' ) )

                return configs
            } )
        }

        function parseConfigs( configs ) {
            var config = {}

            try {
                configs.forEach( function ( cfg ) {
                    if ( typeof( cfg ) == 'string' ) {
                        // var parsed = include.parseJSONC( cfg )
                        var parsed = JSON.parse( cfg )
                        SMK.UTIL.mergeConfig( config, parsed )
                    }
                    else {
                        SMK.UTIL.mergeConfig( config, cfg )
                    }
                    // console.log( cfg )
                } )
            }
            catch ( e ) {
                return SMK.UTIL.rejected( e )
            }

            $.extend( self, config )
            console.log( 'config', self )
        }

        function initMapFrame() {
            return include( 'map-frame-styles' ).then( function () {
                $( self.$option.container )
                    .addClass( 'smk-map-frame' )
                    .addClass( 'smk-viewer-' + self.viewer.type )
            } )
        }

        function initSurround() {
            if ( !self.$option.standalone ) return

            return include( 'surround' ).then( function () {
                self.$surround = new SMK.TYPE.Surround( self )
            } )
        }

        function loadViewer() {
            return include( 'viewer-' + self.viewer.type )
        }

        function initViewer() {
            self.$viewer = new SMK.TYPE.Viewer[ self.viewer.type ]()
            return SMK.UTIL.resolved()
                .then( function () {
                    return self.$viewer.initialize( self )
                } )
                .then( function () {
                    return self.$viewer.initializeLayers( self )
                } )
        }

        function loadTools() {
            self.$tool = {}

            if ( !self.tools || self.tools.length == 0 ) return

            self.tools.push( { type: 'menu' }, { type: 'location' } )

            return SMK.UTIL.waitAll( self.tools.filter( function ( t ) { return t.enabled !== false } ).map( function ( t ) {
                var tag = 'tool-' + t.type
                return include( tag )
                    .then( function ( inc ) {
                        return include( tag + '-' + self.viewer.type )
                            .catch( function () {
                                console.log( 'tool "' + t.type + '" has no ' + self.viewer.type + ' subclass' )
                            } )
                            .then( function () {
                                return inc
                            } )
                    } )
                    .then( function ( inc ) {
                        var id = t.type + ( t.instance ? '--' + t.instance : '' )
                        self.$tool[ id ] = new inc[ tag ]( t )
                        self.$tool[ id ].id = id
                    } )
                    .catch( function ( e ) {
                        console.warn( 'tool "' + t.type + '" failed to create:', e )
                    } )
            } ) )
        }

        function initTools() {
            var ts = Object.keys( self.$tool )
                .sort( function ( a, b ) { return self.$tool[ a ].order - self.$tool[ b ].order } )

            return SMK.UTIL.waitAll( ts.map( function ( t ) {
                return SMK.UTIL.resolved()
                    .then( function () {
                        return self.$tool[ t ].initialize( self )
                    } )
                    .catch( function ( e ) {
                        console.warn( 'tool "' + t + '" failed to initialize:', e )
                    } )
                    .then( function ( tool ) {
                        console.log( 'tool "' + t + '" initialized' )
                    } )
            } ) )
        }

        function showMap() {
            $( self.$option.container )
                .removeClass( 'smk-hidden' )
                .hide()
                .fadeIn( 2000 )
        }
    }

    SmkMap.prototype.destroy = function () {
        if ( this.$viewer )
            this.$viewer.destroy()
    }

    SmkMap.prototype.addToContainer = function ( html, attr, prepend ) {
        return $( html )[ prepend ? 'prependTo' : 'appendTo' ]( this.$option.container ).attr( attr || {} ).get( 0 )
    }

    SmkMap.prototype.addToOverlay = function ( html ) {
        if ( !this.$overlay )
            this.$overlay = this.addToContainer( '<div class="smk-overlay">' )

        return $( html ).appendTo( this.$overlay ).get( 0 )
    }

    SmkMap.prototype.getToolbar = function () {
        var self = this

        if ( this.$toolbar ) return this.$toolbar

        return this.$toolbar = include( 'toolbar' )
            .then( function ( inc ) {
                return new SMK.TYPE.Toolbar( self )
            } )
    }

    SmkMap.prototype.getSidepanel = function () {
        var self = this

        if ( this.$sidepanel ) return this.$sidepanel

        return this.$sidepanel = include( 'sidepanel' )
            .then( function ( inc ) {
                return new SMK.TYPE.Sidepanel( self )
            } )
    }

    SmkMap.prototype.getMenu = function () {
        var self = this

        if ( this.$menu ) return this.$menu

        return this.$menu = include( 'menu' )
            .then( function ( inc ) {
                return new SMK.TYPE.Menu( self )
            } )
    }

    SmkMap.prototype.emit = function () { 
        this.dispatcher.$emit.apply( this.dispatcher, arguments ) 

        return this
    }

    SmkMap.prototype.on = function () { 
        var self = this

        var args = [].slice.call( arguments )

        if ( args.length == 1 ) {
            Object.keys( args[ 0 ] ).forEach( function ( k ) {
                self.dispatcher.$on( k, args[ 0 ][ k ] )
            } )
            return this
        }

        this.dispatcher.$on.apply( this.dispatcher, args )
        return this
    }
} )
