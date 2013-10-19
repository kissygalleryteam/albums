module.exports = function(grunt) {
    grunt.initConfig({
        // 配置文件，参考package.json配置方式，必须设置项是
        // name, version, author
        // name作为gallery发布后的模块名
        // version是版本，也是发布目录
        // author必须是{name: "xxx", email: "xxx"}格式
        pkg: grunt.file.readJSON('abc.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        // kmc打包任务，默认情况，入口文件是index.js，可以自行添加入口文件，在files下面
        // 添加
        kmc: {
            options: {
                packages: [
                    {
                        name: '<%= pkg.name %>',
                        path: '../'
                    }
                ],
                map: [["<%= pkg.name %>/", "gallery/<%= pkg.name %>/"]]
            },
            main: {
                files: [
                    {
                        src: "<%= pkg.version %>/index.js",
                        dest: "<%= pkg.version %>/build/index.js"
                    },
                    {
                        src: "<%= pkg.version %>/theme/weibo.js",
                        dest: "<%= pkg.version %>/build/theme/weibo.js"
                    }
                ]
            }
        },
        // 打包后压缩文件
        // 压缩文件和入口文件一一对应
        uglify: {
            options: {
                banner: '<%= banner %>',
                beautify: {
                    ascii_only: true
                }
            },
            base: {
                files: {
                    '<%= pkg.version %>/build/index-min.js': ['<%= pkg.version %>/build/index.js'],
                    '<%= pkg.version %>/build/theme/weibo-min.js': ['<%= pkg.version %>/build/theme/weibo.js']
                }
            }
        },
        css_combo:{
            main:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= pkg.version %>/theme/css/',
                        src:['*.css'],
                        dest:'<%= pkg.version %>/build/theme/css/'
                    }
                ]
            }
        },
        cssmin:{
            minify:{
                expand:true,
                cwd:'<%= pkg.version %>/build/theme/css/',
                src:['*.css', '!*-min.css'],
                dest:'<%= pkg.version %>/build/theme/css/',
                ext:'-min.css'
            }
        },
        ktpl: {
          main: {
            files: [
              {
                expand:true,
                cwd:'<%= pkg.version %>/theme/',
                src:['*-tpl.html'],
                dest: '<%= pkg.version %>/theme/',
                ext: '.js'
              }
            ]
          }
        }
        
    });

    // 使用到的任务，可以增加其他任务
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-css-combo');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-kmc');
    grunt.loadNpmTasks('grunt-kissy-template');
    return grunt.registerTask('default', ['ktpl', 'kmc', 'uglify', 'css_combo', 'cssmin']);
};
