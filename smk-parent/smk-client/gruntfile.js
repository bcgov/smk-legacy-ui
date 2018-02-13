module.exports = function( grunt ) {

    require( 'load-grunt-tasks' )( grunt )

    grunt.initConfig( {

        package: grunt.file.readJSON('package.json'),

        // deployPath: '/Users/ben/bin/apache-tomcat-7.0.84/webapps/smk-client',
        deployPath: 'target',

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        connect: {
            http: {
                options: {
                    protocol: 'http',
                    hostname: '*',
                    port: 8888,
                    base: '<%= deployPath %>',
                    livereload: true,
                    // open: 'http://localhost:8888/test',
                }
            },
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        copy: {
            'src': {
                expand: true,
                cwd: 'src/main/webapp',
                src: [ '**' ],
                dest: '<%= deployPath %>'
            },

            'test': {
                expand: true,
                cwd: 'src/main/test',
                src: [ '**' ],
                dest: '<%= deployPath %>/test'
            },

            'include': {
                expand: true,
                src: 'lib/include.js',
                dest: '<%= deployPath %>'
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        clean: {
            options: {
                force: true
            },

            'deploy': {
                src: [ '<%= deployPath %>/**' ]
            }
        },

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        watch: {
            options: {
                livereload: true,
                // interrupt: true,
            },

            src: {
                files: [ 'src/main/webapp/**', '!src/main/webapp/smk-tags.json' ],
                tasks: [ 'deploy' ],
            },

            test: {
                files: [ 'src/main/test/**' ],
                tasks: [ 'copy:test' ],
            },            
            
            tags: {
                files: [ 'smk-tags.js', 'lib/**' ],
                tasks: [ 'gen-tags', 'copy:include' ]
            }
        }

    } )

    grunt.registerTask( 'gen-tags', function () {
        // delete require.cache[ require.resolve( './tag-gen' ) ]
        require.cache={}
        // grunt.log.writeln( require.resolve( './smk-tags' ) )
        // grunt.log.writeln( require.cache[ require.resolve( './smk-tags' ) ] )
        // delete require.cache[ require.resolve( './smk-tags' ) ]
        // grunt.log.writeln( require.cache[ require.resolve( './smk-tags' ) ] )

        var tags = require( './smk-tags' )
        grunt.file.write( 'src/main/webapp/smk-tags.json', JSON.stringify( tags.gen(), null, '  ' ) )
    } )

    grunt.registerTask( 'deploy', [
        'gen-tags',
        'clean:deploy',
        'copy:src',
        'copy:include',
        'copy:test',
    ] )

    grunt.registerTask( 'default', [
        'deploy',
        'connect',
        'watch'
    ] )

}