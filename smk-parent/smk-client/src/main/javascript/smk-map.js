include.module( 'smk-map', [ 'jquery', 'util', 'viewer', 'layer' ], function () {

    function SmkMap( option ) {
        this.$option = option

        this.$dispatcher = new Vue()
    }

    SMK.TYPE.SmkMap = SmkMap

    SmkMap.prototype.initialize = function () {
        var self = this;

        console.log( 'smk initialize:', this.$option )

        this.$container = document.getElementById( this.$option[ 'container-id' ] )
        if ( !this.$container )
            throw new Error( 'Unable to find container #' + this.$option[ 'container-id' ] )

        $( this.$container )
            .addClass( 'smk-hidden' )

        return SMK.UTIL.resolved()
            .then( loadConfigs )
            .then( mergeConfigs )
            .then( initMapFrame )
            .then( loadSurround )
            .then( loadViewer )
            .then( loadTools )
            .then( initViewer )
            .then( initTools )
            .then( initSurround )
            .then( showMap )

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        function loadConfigs() {
            return SMK.UTIL.waitAll( self.$option.config.map( function ( c ) {
                if ( !c.url )
                    return SMK.UTIL.resolved( c )

                var id = c.url.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /^[-]|[-]$/g, '' )
                var tag = 'config-' + id
                include.tag( tag, { loader: 'template', url: c.url } )

                return include( tag )
                    .then( function ( inc ) {
                        try {
                            var obj = JSON.parse( inc[ tag ] )
                            obj.$sources = c.$sources
                            return obj
                        }
                        catch ( e ) {
                            console.warn( c.$sources[ 0 ], inc[ tag ] )
                            e.parseSource = c.$sources[ 0 ]
                            throw e
                        }
                    } )
            } ) )
        }

        function mergeConfigs( configs ) {
            var config = Object.assign( {}, SMK.CONFIG )
            config.$sources = []

            console.log( 'base', JSON.stringify( config, null, '  ' ) )

            while( configs.length > 0 ) {
                var c = configs.shift()

                console.log( 'merging', JSON.stringify( c, null, '  ' ) )

                mergeSurround( config, c )
                mergeViewer( config, c )
                mergeTools( config, c )
                mergeLayers( config, c )

                config.$sources = config.$sources.concat( c.$sources || '(unknown)' )
                delete c.$sources

                Object.assign( config, c )

                console.log( 'merged', JSON.stringify( config, null, '  ' ) )
            }

            Object.assign( self, config )

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            function mergeSurround( base, merge ) {
                if ( !merge.surround ) return

                if ( base.surround ) {
                    if ( base.surround.subtitles && merge.surround.subtitles ) {
                        base.surround.subtitles = base.surround.subtitles.concat( merge.surround.subtitles )
                        delete merge.surround.subtitles
                    }

                    Object.assign( base.surround, merge.surround )
                }
                else {
                    base.surround = merge.surround
                }

                delete merge.surround
            }

            function mergeViewer( base, merge ) {
                if ( !merge.viewer ) return

                if ( base.viewer ) {
                    Object.assign( base.viewer, merge.viewer )
                }
                else {
                    base.viewer = merge.viewer
                }

                delete merge.viewer
            }


            function mergeTools( base, merge ) {
                return mergeCollection( base, merge, 'tools', {
                    findFn: function ( merge ) {
                        return function ( base ) {
                            return merge.type == base.type &&
                                merge.instance == base.instance
                        }
                    }
                } )
            }

            function mergeLayers( base, merge ) {
                return mergeCollection( base, merge, 'layers', {
                    mergeFn: function ( baseLayer, mergeLayer ) {
                        mergeCollection( baseLayer, mergeLayer, 'queries', {
                            mergeFn: function ( baseQuery, mergeQuery ) {
                                mergeCollection( baseQuery, mergeQuery, 'parameters', {} )

                                Object.assign( baseQuery, mergeQuery )
                            }
                        } )

                        mergeLayers( baseLayer, mergeLayer )

                        Object.assign( baseLayer, mergeLayer )
                    }
                } )
            }

            function mergeCollection( base, merge, prop, arg ) {
                var findFn = arg[ 'findFn' ] || function ( merge ) {
                    return function ( base ) {
                        return merge.id == base.id
                    }
                }

                var mergeFn = arg[ 'mergeFn' ] || function ( base, merge ) {
                    Object.assign( base, merge )
                }

                if ( !merge[ prop ] ) return

                if ( base[ prop ] ) {
                    merge[ prop ].forEach( function( m ) {
                        var item = base[ prop ].find( findFn( m ) )

                        if ( item )
                            mergeFn( item, m )
                        else
                            base[ prop ].push( m )
                    } )
                }
                else {
                    base[ prop ] = merge[ prop ]
                }

                delete merge[ prop ]
            }

        }

        function initMapFrame() {
            $( self.$container )
                .addClass( 'smk-map-frame' )
                .addClass( 'smk-viewer-' + self.viewer.type )
        }

        function loadSurround() {
            if ( !self.$option.standalone ) return

            return include( 'surround' )
        }

        function initSurround() {
            if ( !self.$option.standalone ) return

            self.$surround = new SMK.TYPE.Surround( self )
        }

        function loadViewer() {
            return include( 'viewer-' + self.viewer.type )
                .catch( function () {
                    throw new Error( 'viewer type ' + ( self.viewer.type ? '"' + self.viewer.type + '" ' : '' ) + 'is not defined' )
                } )
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

            self.tools.push( { type: 'location' } )

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
            $( self.$container )
                .removeClass( 'smk-hidden' )
                .hide()
                .fadeIn( 1000 )

            if ( self.viewer.activeTool in self.$tool )
                self.$tool[ self.viewer.activeTool ].active = true
        }
    }

    SmkMap.prototype.destroy = function () {
        if ( this.$viewer )
            this.$viewer.destroy()
    }

    SmkMap.prototype.addToContainer = function ( html, attr, prepend ) {
        return $( html )[ prepend ? 'prependTo' : 'appendTo' ]( this.$container ).attr( attr || {} ).get( 0 )
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

    SmkMap.prototype.emit = function ( toolId, event, arg ) {
        this.$dispatcher.$emit( toolId + '.' + event, arg )

        return this
    }

    SmkMap.prototype.on = function ( toolId, handler ) {
        var self = this

        Object.keys( handler ).forEach( function ( k ) {
            self.$dispatcher.$on( toolId + '.' + k, handler[ k ] )
        } )

        return this
    }
} )
