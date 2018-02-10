module.exports = function( grunt ) {

    require( 'load-grunt-tasks' )( grunt )

    grunt.initConfig( {

        package: grunt.file.readJSON('package.json'),

        deployPath: '/Users/ben/bin/apache-tomcat-7.0.84/webapps/smk-client',

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        // connect: {
        //     http: {
        //         options: {
        //             protocol: 'http',
        //             hostname: '*',
        //             port: 8888,
        //             base: '<%= root %>',
        //             livereload: true,
        //             open: true,
        //         }
        //     },
        // },

        copy: {
            'src': {
                expand: true,
                cwd: 'src/main/webapp',
                src: [ '**' ],
                dest: '<%= deployPath %>'
            },

            'include': {
                expand: true,
                src: 'lib/include.js',
                dest: 'src/main/webapp'
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
            src: {
                files: [ 'src/main/webapp/**', '!src/main/webapp/smk-tags.json', '!src/main/webapp/lib/include.js', ],
                tasks: [ 'deploy' ],
                // options: {
                //     livereload: true,
                //     interrupt: true,
                // }
            },
            tags: {
                files: [ 'smk-tags.js', 'lib/**' ],
                tasks: [ 'gen-tags', 'copy:include', 'deploy' ]
            }
        }

    } )

    grunt.registerTask( 'gen-tags', function () {
        delete require.cache[ require.resolve( './smk-tags' ) ]
        var tags = require( './smk-tags' )
        grunt.file.write( 'src/main/webapp/smk-tags.json', JSON.stringify( tags.gen(), null, '  ' ) )
    } )

    grunt.registerTask( 'deploy', [
        'clean:deploy',
        'copy:src'
    ] )

    grunt.registerTask( 'default', [
        'gen-tags',
        'copy:include',
        'deploy',
        'watch'
    ] )

}