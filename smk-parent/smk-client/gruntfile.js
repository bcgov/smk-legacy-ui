module.exports = function( grunt ) {

    var path = require( "path" );

    require( 'load-grunt-tasks' )( grunt )

    grunt.initConfig( {
        package: grunt.file.readJSON( 'package.json' ),

        srcPath: 'src/main/javascript',

        buildPath: 'build',

        serverHost: 'localhost',

        processTemplate: function ( content, srcpath ) {
            return content.replace( /\<\%\=\s*[^%]+\s*\%\>/gi, function (m) {
                grunt.log.writeln( srcpath + ': ' + m );
                return grunt.template.process( m );
            } )
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        connectOption: {
            http: {
                options: {
                    protocol: 'http',
                    hostname: '*',
                    port: 8888,
                    base: '<%= buildPath %>',
                    livereload: true,
                    // debug: true
                }
            },
            https: {
                options: {
                    protocol: 'https',
                    hostname: '*',
                    port: 8443,
                    base: '<%= buildPath %>',
                    livereload: true,
                    // debug: true
                }
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        copy: {
            'src': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ '**' ],
                dest: '<%= buildPath %>'
            },

            'test-html': {
                expand: true,
                cwd: 'src/main/test',
                src: [ '*html' ],
                dest: '<%= buildPath %>/test',
                options: {
                    process: '<%= processTemplate %>',
                },
            },

            'test': {
                expand: true,
                cwd: 'src/main/test',
                src: [ '**', '!**/*html' ],
                dest: '<%= buildPath %>/test'
            },

            'include': {
                expand: true,
                src: 'lib/include.js',
                dest: '<%= buildPath %>'
            },

            'deploy': {}
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        clean: {
            options: {
                force: true
            },

            'build': {
                src: [ '<%= buildPath %>/**' ]
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        filelist: {
            configs: {
                files: [
                    {
                        cwd: 'src/main/test/config',
                        src: [
                            '*json',
                        ],
                        dest: '<%= buildPath %>/test/configs.json'
                    }
                ]
            },
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        watch: {
            options: {
                livereload: {
                    // debounceDelay: 5000,
                    host:   '<%= serverHost %>',
                    key:    grunt.file.read( 'node_modules/grunt-contrib-connect/tasks/certs/server.key' ),
                    cert:   grunt.file.read( 'node_modules/grunt-contrib-connect/tasks/certs/server.crt' )
                },
                spawn: false
                // interrupt: true,
            },

            src: {
                files: [ '<%= srcPath %>/**' ],
                tasks: [ 'build' ],
            },

            test: {
                files: [ 'src/main/test/**' ],
                tasks: [ 'filelist:configs:filelist', 'copy:test-html', 'copy:test', 'copy:deploy' ],
            },

            tags: {
                files: [ 'smk-tags.js', 'lib/**' ],
                tasks: [ 'gen-tags', 'copy:include', 'copy:deploy' ]
            }
        }

    } )

    grunt.registerTask( 'gen-tags', function () {
        // seems to be only way to clear require cache
        for ( var key in require.cache )
            delete require.cache[ key ]

        var tags = require( './smk-tags' )
        var out = grunt.template.process( '<%= buildPath %>/smk-tags.json' )
        grunt.file.write( out, JSON.stringify( tags.gen(), null, '  ' ) )
        grunt.log.writeln( 'Wrote tags to ' + out )
    } )

    grunt.registerTask( 'deploy', 'set deploy dir', function ( dir ) {
        grunt.config( 'deployPath', dir )
        grunt.log.writeln( 'deployPath: ' + grunt.config( 'deployPath' ) )

        grunt.config.merge( {
            copy: {
                'deploy': {
                    expand: true,
                    cwd: '<%= buildPath %>',
                    src: '**',
                    dest: '<%= deployPath %>'
                }
            }
        } )

        grunt.task.run( 'build', 'watch' )
    } )

    grunt.registerTask( 'use', 'connection to use', function ( protocol, host ) {
        var connectOption = grunt.config( 'connectOption' )

        if ( !( protocol in connectOption ) ) return

        var connectConfig = { connect: {} }
        connectConfig.connect[ protocol ] = connectOption[ protocol ]

        grunt.config.merge( connectConfig )

        if ( host )
            grunt.config( 'serverHost', host )

        grunt.log.writeln( 'Use connection: ' + protocol )
        grunt.log.writeln( 'Server host: ' + grunt.config( 'serverHost' ) )

        grunt.task.run(
            'build',
            'connect',
            'watch'
        )
    } )

    grunt.registerMultiTask( 'filelist', 'Writes JSON blobs containing names of the matched files to sub-keys for destination in a config setting', function ( setting ) {
        var out = {};
        this.files.forEach( function ( f ) {
            var cwd = f.cwd || '';

            var dest = path.basename( f.dest, path.extname( f.dest ) )

            var list = f.src.map( function ( filename ) {
                var s = path.join( cwd, filename )
                if ( !grunt.file.isFile( s ) ) return;

                grunt.log.writeln( dest + ': ' + filename )
                return {
                    // name: path.basename( s ),
                    path: filename,
                }
            } ).filter( function ( e ) { return !!e } )

            out[ dest ] = list
        } )

        if ( setting )
            grunt.config( setting, jsonOut( out ) )

        function jsonOut( obj ) {
            return JSON.stringify( obj )
        }
    } )

    grunt.registerTask( 'build', [
        'clean:build',
        'gen-tags',
        'copy:src',
        'copy:include',
        'filelist:configs:filelist',
        'copy:test-html',
        'copy:test',
        'copy:deploy'
    ] )

    grunt.registerTask( 'default', 'use:https' )

}