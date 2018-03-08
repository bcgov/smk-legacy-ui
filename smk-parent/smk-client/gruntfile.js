module.exports = function( grunt ) {

    require( 'load-grunt-tasks' )( grunt )

    grunt.initConfig( {
        package: grunt.file.readJSON( 'package.json' ),

        srcPath: 'src/main/javascript',

        buildPath: 'build',

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        connect: {
            http: {
                options: {
                    protocol: 'http',
                    hostname: '*',
                    port: 8888,
                    base: '<%= buildPath %>',
                    livereload: true,
                    // open: 'http://localhost:8888/test',
                }
            },
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        copy: {
            'src': {
                expand: true,
                cwd: '<%= srcPath %>',
                src: [ '**' ],
                dest: '<%= buildPath %>'
            },

            'test': {
                expand: true,
                cwd: 'src/main/test',
                src: [ '**' ],
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

        watch: {
            options: {
                livereload: true,
                spawn: false
                // interrupt: true,
            },

            src: {
                files: [ '<%= srcPath %>/**' ],
                tasks: [ 'build' ],
            },

            test: {
                files: [ 'src/main/test/**' ],
                tasks: [ 'copy:test', 'copy:deploy' ],
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
        grunt.log.writeln( 'wrote tags to ' + out )
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

    grunt.registerTask( 'build', [
        'clean:build',
        'gen-tags',
        'copy:src',
        'copy:include',
        'copy:test',
        'copy:deploy'
    ] )

    grunt.registerTask( 'default', [
        'build',
        'connect',
        'watch'
    ] )

}