module.exports = function( grunt ) {

    var path = require( "path" );

    require( 'load-grunt-tasks' )( grunt )

    var jshintStylish = require( 'jshint-stylish' )
    jshintStylish.reporter = ( function ( inner ) {
        return function ( result, config ) {
            return inner( result, config, { verbose: true } )
        }
    } )( jshintStylish.reporter )

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
            'root': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ 'index.html', 'map-config.json', 'readme.md' ],
                dest: '<%= buildPath %>',
                options: {
                    process: '<%= processTemplate %>',
                },
            },

            'images': {
                expand: true,
                cwd: '<%= srcPath %>/smk',
                src: [ '**/*.{gif,png,jpg,jpeg}' ],
                dest: '<%= buildPath %>/images'
            },

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
            },

            temp: {
                src: [ '<%= buildPath %>/smk-tags-*.js' ]
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        jshint: {
            options: {
                reporter: jshintStylish,
                // reporter: 'checkstyle',

                // unused: true,
                // latedef: true,
                // curly: true,
                // eqeqeq: true,
                bitwise: true,
                strict: true,
                undef: true,
                asi: true,
                plusplus: true,
                eqnull: true,
                multistr: true,
                sub: true,
                browser: true,
                devel: true,

                '-W018': true, // confusing use of !

                globals: {
                    SMK: true,
                    $: true,
                    Vue: true,
                    console: true,
                    Promise: true,
                    include: true,
                    require: true,
                    turf: true,
                    Terraformer: true,
                    proj4: true,
                    L: true,
                },
            },
            lib: [ '<%= srcPath %>/smk/**/*js', '!<%= srcPath %>/smk/**/lib/**', '!<%= srcPath %>/smk/**/*.min.js' ],
            smk: [ '<%= buildPath %>/smk.js' ],
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        zip: {
            dev: {
                expand: true,
                dest: '<%= buildPath %>/smk-<%= pom.project.parent.version %>-development.zip',
                src: [ './**/*', '!./build/**', '!./etc/**', '!./node*/**', '!./target/**' ]
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
                files: [ '<%= srcPath %>/**', 'smk-tags.js', 'lib/**' ],
                tasks: [ 'build' ]
            },

            test: {
                files: [ 'src/main/test/**' ],
                tasks: [ 'build-test' ]
            },
        }

    } )

    grunt.registerTask( 'gen-tags', function () {
        // seems to be only way to clear require cache
        for ( var key in require.cache )
            delete require.cache[ key ]

        var tags = require( './smk-tags' )
        grunt.log.write( 'Generating tags...' )
        var tagData = tags.gen()
        grunt.log.ok()

        grunt.config( 'tag', JSON.parse( JSON.stringify( tagData ) ) )
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

    grunt.registerTask( 'mode', 'build mode', function ( mode ) {
        grunt.loadTasks( 'tasks/' + mode )
        if ( grunt.config( 'mode' ) )
            grunt.log.ok( 'Loaded build mode ' + grunt.log.wordlist( [ mode ] ) )
        else
            grunt.fail.fatal( 'Build mode ' + mode + ' not found' )
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

    grunt.registerTask( 'build-info', function () {
        if ( grunt.config( 'pom' ) )
            grunt.task.run( [ 'gitinfo' ] )
        else
            grunt.task.run( [ 'gitinfo', 'mavenEffectivePom' ] )
    } )


    grunt.registerTask( 'build', [
        'clean:build',
        'build-info',
        'build-lib',
        'build-images',
        'build-smk',
        'build-samples',
        'build-root',
        'clean:temp',
    ] )

    grunt.registerTask( 'write-tag-head-foot', function () {
        var fn = grunt.template.process( '<%= buildPath %>/smk-tags-head.js' )
        grunt.file.write( fn, 'if ( !window.include.SMK ) { ( function () {\n"use strict";\n' )

        var fn = grunt.template.process( '<%= buildPath %>/smk-tags-foot.js' )
        grunt.file.write( fn, '\nwindow.include.SMK = true\n} )() }\n' )
    } )

    grunt.registerTask( 'build-smk', function () {
        grunt.fail.fatal( 'Build mode isn\'t set' )
    } )

    grunt.registerTask( 'build-lib', function () {
        grunt.fail.fatal( 'Build mode isn\'t set' )
    } )

    grunt.registerTask( 'build-images', [
        'copy:images',
    ] )

    grunt.registerTask( 'build-samples', [
        'copy:samples',
    ] )

    grunt.registerTask( 'build-test', [
        'clean:test',
        // 'filelist:configs:filelist',
        // 'copy:test-html',
        'copy:test',
    ] )

    grunt.registerTask( 'build-root', [
        'copy:root',
    ] )

    grunt.registerTask( 'build-dev-kit', [
        'zip:dev',
    ] )
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    grunt.registerTask( 'default', [
        'mode:dev',
        'use:https',
    ] )

    grunt.registerTask( 'maven', [
        'mode:release',
        'clean:all',
        'build',
        'build-dev-kit'
    ] )

}