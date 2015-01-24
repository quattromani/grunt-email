module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({

    config: {
      src: 'src',
      dist: 'dist'
    },

    // Takes your scss files and compiles them to css
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'src/css/main.css': 'src/css/scss/main.scss'
        }
      }
    },

    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
          'dist'
          ]
        }
      }
    },

    // Assembles your email content with html layout
    assemble: {
      options: {
        layoutdir: 'src/layouts',
        flatten: true
      },
      pages: {
        src: ['src/emails/*.hbs'],
        dest: 'dist/'
      }
    },

    // Inlines your css
    premailer: {
      html: {
        options: {
          removeComments: true
        },
        files: [{
          expand: true,
          src: ['dist/*.html'],
          dest: ''
        }]
      },
      txt: {
        options: {
          mode: 'txt'
        },
        files: [{
          expand: true,
          src: ['dist/*.html'],
          dest: '',
          ext: '.txt'
        }]
      }
    },

    // Watches for changes to css or email templates then runs grunt tasks
    // watch: {
    //   files: ['src/css/scss/*','src/emails/*','src/layouts/*'],
    //   tasks: ['build']
    // },

    watch: {
      assemble: {
        files: ['src/css/scss/*','src/emails/*','src/layouts/*'],
        tasks: ['build']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'dist/{,*/}*.html'
        ]
      }
    },

    // Use Mailgun option if you want to email the design to your inbox or to something like Litmus
    // grunt send --template=transaction.html
    mailgun: {
      mailer: {
        options: {
          key: 'key-5303e1f6ac9d0c9bcb55c488b40d50d9', // Enter your Mailgun API key here
          sender: 'max@qoppa.co', // Change this
          recipient: 'max@qoppa.co', // Change this
          subject: 'This is a test email'
        },
        src: ['dist/'+grunt.option('template')]
      }
    },

    // Use Rackspace Cloud Files if you're using images in your email
    cloudfiles: {
      prod: {
        'user': 'Rackspace Cloud Username', // Change this
        'key': 'Rackspace Cloud API Key', // Change this
        'region': 'ORD', // Might need to change this
        'upload': [{
          'container': 'Files Container Name', // Change this
          'src': 'src/img/*',
          'dest': '/',
          'stripcomponents': 0
        }]
      }
    },

    // CDN will replace local paths with your Cloud CDN path
    cdn: {
      options: {
        cdn: 'Rackspace Cloud CDN URI', // Change this
        flatten: true,
        supportedTypes: 'html'
      },
      dist: {
        src: ['./dist/*.html']
      }
    },

    // Send your email template to Litmus for testing
    // grunt litmus --template=transaction.html
    litmus: {
      test: {
        src: ['dist/'+grunt.option('template')],
        options: {
          username: 'username', // Change this
          password: 'password', // Change this
          url: 'https://yourcompany.litmus.com', // Change this
          clients: ['android4', 'aolonline', 'androidgmailapp', 'aolonline', 'ffaolonline',
          'chromeaolonline', 'appmail6', 'iphone6', 'ipadmini', 'ipad', 'chromegmailnew',
          'iphone6plus', 'notes85', 'ol2002', 'ol2003', 'ol2007', 'ol2010', 'ol2011',
          'ol2013', 'outlookcom', 'chromeoutlookcom', 'chromeyahoo', 'windowsphone8'] // https://#{company}.litmus.com/emails/clients.xml
        }
      }
    },

    copy: {
      images: {
        expand: true,
        cwd: 'src/images',
        src: '**',
        dest: 'dist/images'
      }
    },

    // remove any previously-created files.
    clean: ['dist/**/*.{html,txt,xml}']

  });

  grunt.loadNpmTasks('assemble');

  grunt.registerTask('server', [
    'build',
    'assemble',
    'premailer',
    'connect:livereload',
    'watch'
    ]);

  grunt.registerTask('build', [
    'sass',
    'clean',
    'copy',
    'assemble',
    'premailer'
    ]);

  grunt.registerTask('default', [
    'build'
    ]);

  // Use `grunt send --template=index.html`
    grunt.registerTask('send', ['mailgun']);

};
