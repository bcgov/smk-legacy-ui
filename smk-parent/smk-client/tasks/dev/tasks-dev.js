module.exports = function( grunt ) {

    var jshintStylish = require( 'jshint-stylish' )
    jshintStylish.reporter = ( function ( inner ) {
        return function ( result, config ) {
            return inner( result, config, { verbose: true } )
        }
    } )( jshintStylish.reporter )

    grunt.config( 'mode', 'dev' )

    grunt.registerTask( 'build-lib', [
        'jshint:lib',
        'copy:lib',
    ] )

    grunt.registerTask( 'build-smk', [
        'gen-tags',
        'write-tags',
        'write-tag-head-foot',
        'concat:smk',
        'jshint:smk',
    ] )

    grunt.registerTask( 'write-tags', function () {
        var tag = grunt.config( 'tag' )
        var tags = Object.keys( tag ).sort()

        var fn = grunt.template.process( '<%= buildPath %>/smk-tags.js' )
        grunt.log.write( 'Writing ' + tags.length + ' tags to ' + fn + '...' )
        grunt.file.write( fn, tags.map( function ( t ) { return 'include.tag( "' + t + '", ' + JSON.stringify( tag[ t ], null, '    ' ) + ' );' } ).join( '\n\n' ) )
        grunt.log.ok()
    } )

    grunt.config.merge( {
        clean: {
            temp: {
                src: [ undefined, '<%= buildPath %>/smk-tags.js' ]
            }
        },

        copy: {
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
                ]
            },
        },

        concat: {
            smk: {
                options: {
                    banner: '// SMK\n',
                    process: '<%= processTemplate %>',
                },
                src: [
                    'lib/include.js',
                    '<%= buildPath %>/smk-tags-head.js',
                    '<%= buildPath %>/smk-tags.js',
                    '<%= buildPath %>/smk-tags-foot.js',
                    '<%= srcPath %>/smk.js'
                ],
                dest: '<%= buildPath %>/smk.js'
            }
        },

        jshint: {
            options: {
                reporter: jshintStylish,

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
                    $: true,
                    Vue: true,
                    include: true,
                    require: true,
                    console: true,
                    SMK: true,
                    turf: true,
                    Terraformer: true,
                    proj4: true,
                    L: true,
                    Promise: true,
                },
            },
            lib: [ '<%= srcPath %>/smk/**/*js', '!<%= srcPath %>/smk/**/lib/**', '!<%= srcPath %>/smk/**/*.min.js' ],
            smk: [ '<%= buildPath %>/smk.js' ],
        }
    } )

}