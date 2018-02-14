include.module( 'smk-map', [ 'smk', 'jquery', 'util', 'viewer', 'layer' ], function () {

    function SmkMap( option ) {
        this.$option = option

        this.$option.container = $( '#' + this.$option.containerId ).get( 0 )
        if ( !this.$option.container )
            throw new Error( 'Unable to find container #' + this.$option.containerId )
    }

    SMK.TYPE.SmkMap = SmkMap

    SmkMap.prototype.initialize = function () {
        var self = this;

        console.log( 'smk initialize:', this.$option )

        $( this.$option.container )
            .addClass( 'smk-hidden' )

        var tags = this.$option.configUrls.map( function ( url ) {
            var tag = 'config-' + url
            include.tag( tag, { loader: 'template', url: './' + url } )
            return tag
        } )

        return include( tags ).then ( function ( inc ) {
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
            .then( parseConfigs )
            .then( initMapFrame )
            .then( initSurround )
            .then( showMap )
            .then( loadViewer )
            .then( loadTools )
            .then( initViewer )
            .then( initTools )
            .then( initSidebar )
            .then( null, function ( e ) {
                console.error( 'smk viewer #' + self.$option.containerId + ' failed to initialize:', e )
            } )

        function parseConfigs( configs ) {
            var config = {}

            try {
                configs.forEach( function ( cfg ) {
                    if ( typeof( cfg ) == 'string' ) {
                        var parsed = JSON.parse( cfg.replace( /^\s*\/\/.*$/mg, '' ).replace( /^\s*return\s*/mg, '' ) )
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

            return include( 'surround' ).then( function ( inc ) {
                $( self.$option.container )
                    .toggleClass( 'smk-show-header' ) //, self.surround.showHeader )

                var expanded = SMK.UTIL.templateReplace( inc.surround[ 'surround-header' ], function ( k ) {
                    return eval( 'self.' + k )
                } )

                self.addToContainer( expanded, { id: 'smk-header' }, true )
            } )
        }

        function loadViewer() {
            return include( 'viewer-' + self.viewer.type )
        }

        function initViewer() {
            self.$viewer = new SMK.TYPE.Viewer[ self.viewer.type ]()
            return self.$viewer.initialize( self )
        }

        function loadTools() {
            if ( !self.tools ) return
            // var toolIds = Object.keys( self.tools )
            if ( self.tools.length == 0 ) return

            self.$tool = {}

            return SMK.UTIL.waitAll( self.tools.map( function ( t ) {
                var tag = 'tool-' + t.type + '-' + self.viewer.type
                return include( tag )
                    .catch( function () {
                        tag = 'tool-' + t.type
                        return include( tag )
                    } )
                    .then( function ( inc ) {
                        self.$tool[ t.type ] = inc[ tag ]
                        self.tools[ t.type ] = t
                    } )
                    .catch( function () {
                        console.warn( 'tool "' + t.type + '" has no implementation' )
                    } )
            } ) )
        }

        function initTools() {
            var ts = Object.keys( self.$tool )
                .sort( function ( a, b ) { return self.$tool[ a ].order - self.$tool[ b ].order } )

            return SMK.UTIL.waitAll( ts.map( function ( t ) {
                return SMK.UTIL.resolved()
                    .then( function () {
                        return self.$tool[ t ].initialize( self, self.tools[ t ] )
                    } )
                    .then( function () {
                        console.log( 'tool "' + t + '" initialized' )
                    } )
                    .catch( function ( e ) {
                        console.warn( 'tool "' + t + '" failed to initialize:', e )
                    } )
            } ) )
        }

        function initSidebar() {
            return include( 'sidebar' )
                .then( function () {
                    self.$sidebar = new SMK.TYPE.SideBar()
                } )
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

    SmkMap.prototype.getSidebar = function () {
        if ( this.$sidebar ) return this.$sidebar

        return this.$sidebar = new SMK.TYPE.Sidebar( this )
    }

} )