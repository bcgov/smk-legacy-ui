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

        gitinfo: {},

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        mavenEffectivePom: {
            main: {
                options: {
                    file: 'target/effective-pom.xml',
                    varName: 'pom'
                }
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        copy: {
            'smk': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ 'smk.js', 'index.html', 'map-config.json' ],
                dest: '<%= buildPath %>',
                options: {
                    process: '<%= processTemplate %>',
                },
            },

            'lib': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= srcPath %>/smk',
                        src: [ '**' ],
                        dest: '<%= buildPath %>/smk'
                    },
                    {
                        expand: true,
                        cwd: '<%= srcPath %>/lib',
                        src: [ '**' ],
                        dest: '<%= buildPath %>/lib'
                    },
                    {
                        expand: true,
                        src: 'lib/include.js',
                        dest: '<%= buildPath %>'
                    }
                ]
            },

            // 'test-html': {
            //     expand: true,
            //     cwd: 'src/main/test',
            //     src: [ '*html' ],
            //     dest: '<%= buildPath %>/test',
            //     options: {
            //         process: '<%= processTemplate %>',
            //     },
            // },

            'test': {
                expand: true,
                cwd: 'src/main/test',
                src: [ 'attachments/**', 'config/**' ],
                dest: '<%= buildPath %>'
            },

            'samples': {
                expand: true,
                cwd: '<%= srcPath %>/samples',
                src: [ '**' ],
                dest: '<%= buildPath %>/samples'
            },

            'deploy': {}
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        clean: {
            options: {
                force: true
            },

            all: {
                src: [ '<%= buildPath %>/**' ]
            },

            'build': {
                src: [ '<%= buildPath %>/**', '!<%= buildPath %>', '!<%= buildPath %>/attachments/**', '!<%= buildPath %>/config/**' ]
            },

            'test': {
                src: [ '<%= buildPath %>/attachments/**', '<%= buildPath %>/config/**' ]
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        // filelist: {
        //     configs: {
        //         files: [
        //             {
        //                 cwd: 'src/main/test/config',
        //                 src: [
        //                     '*json',
        //                 ],
        //                 dest: '<%= buildPath %>/test/configs.json'
        //             }
        //         ]
        //     },
        // },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        watch: {
            options: {
                livereload: {
                    // debounceDelay: 5000,
                    host:   '<%= serverHost %>',
                    key:    grunt.file.read( 'node_modules/grunt-contrib-connect/tasks/certs/server.key' ),
                    cert:   grunt.file.read( 'node_modules/grunt-contrib-connect/tasks/certs/server.crt' )
                },
                livereloadOnError: false,
                spawn: false
                // interrupt: true,
            },

            src: {
                files: [ '<%= srcPath %>/**' ],
                tasks: [ 'build' ]
            },

            test: {
                files: [ 'src/main/test/**' ],
                tasks: [ 'build-test' ]
            },

            tags: {
                files: [ 'smk-tags.js', 'lib/**' ],
                tasks: [ 'gen-tags', 'build' ]
            }
        }

    } )

    grunt.registerTask( 'gen-tags', function () {
        // seems to be only way to clear require cache
        for ( var key in require.cache )
            delete require.cache[ key ]

        var tags = require( './smk-tags' )
        var tagData = tags.gen()
        // var out = grunt.template.process( '<%= buildPath %>/smk-tags.json' )

        var includes = []
        Object.keys( tagData ).sort().forEach( function ( t ) {
            includes.push( 'include.tag( "' + t + '", ' + JSON.stringify( tagData[ t ], null, '    ' ) + ' )' )
        } )

        grunt.config( 'includes', includes.join( '\n' ) )
        // grunt.file.write( out, JSON.stringify( , null, '  ' ) )
        grunt.log.writeln( 'Output ' + includes.length + ' tags' )
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
            'clean:all',
            'build',
            'build-test',
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
        'mavenEffectivePom',
        'gitinfo',
        'clean:build',
        'gen-tags',
        'copy:smk',
        'copy:lib',
        'copy:samples',
    ] )

    grunt.registerTask( 'build-test', [
        'clean:test',
        // 'filelist:configs:filelist',
        // 'copy:test-html',
        'copy:test',
    ] )

    grunt.registerTask( 'default', [
        'use:https',
    ] )

    grunt.registerTask( 'maven', [
        'clean:all',
        'build',
    ] )

}