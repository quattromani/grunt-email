module.exports = function(grunt) {

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

  grunt.initConfig({

  	// Project configuration
  	config: {
  		src: 'src',
  		dist: 'dist'
  	},

    // SCSS to CSS
    sass: {
    	dist: {
    		options: {
    			style: 'expanded'
    		},
    		files: {
    			'<%= config.src %>/css/main.css': '<%= config.src %>/css/scss/main.scss'
    		}
    	}
    },

    // Clean up and remove any unused CSS - prepare for inlining
    uncss: {
      dist: {
        src: ['<%= config.src %>/index.html'],
        dest: '<%= config.dist %>/css/tidy.css',
        options: {
        	ignoreSheets : [/fonts.googleapis/],
          report: 'gzip'
        }
      }
    },

    // Recompile to /dist folder
    processhtml: {
		  dist: {
		    files: {
		      '<%= config.dist %>/index.html': ['<%= config.src %>/index.html']
		    }
		  }
		},

		// Setup a localhost & start livereload
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
      		base: ['dist']
      	}
      }
    },

    // Assembles your email content with html layout
    assemble: {
    	options: {
    		flatten: true,
    		layoutdir: '<%= config.src %>/layouts',
    		data: '<%= config.src %>/data/*.{json,yml}',
    		partials: '<%= config.src %>/partials/{,*/}*.hbs'
    	},
	    pages: {
	    	src: ['<%= config.src %>/emails/*.hbs'],
	    	dest: '<%= config.src %>/'
	    }
	  },

    // Inline CSS and create a .txt version
    premailer: {
    	html: {
    		options: {
    			removeComments: true
    		},
    		files: [{
    			expand: true,
    			src: ['<%= config.dist %>/*.html'],
    			dest: ''
    		}]
    	},
    	txt: {
    		options: {
    			mode: 'txt'
    		},
    		files: [{
    			expand: true,
    			src: ['<%= config.dist %>/*.html'],
    			dest: '',
    			ext: '.txt'
    		}]
    	}
    },

    // Watch for changes and fire livereload
    watch: {
    	assemble: {
    		files: [
    			'<%= config.src %>/css/scss/{,*/}*.scss',
    			'<%= config.src %>/emails/*',
    			'<%= config.src %>/layouts/*',
    			'<%= config.src %>/partials/*'
    		],
    		tasks: ['email']
    	},
    	livereload: {
    		options: {
    			livereload: '<%= connect.options.livereload %>'
    		},
    		files: ['<%= config.dist %>/{,*/}*.html']
  		}
		},

    // Use Mailgun option if you want to email the design to your inbox or to something like Litmus
    // grunt send --template=transaction.html
    mailgun: {
    	mailer: {
    		options: {
          key: 'key-5303e1f6ac9d0c9bcb55c488b40d50d9', // Enter your Mailgun API key here
          sender: 'max@placewise.com', // Change this
          recipient: 'max@placewise.com', // Change this
          subject: 'This is it!'
        },
        src: ['<%= config.dist %>/'+grunt.option('template')]
      }
    },

    // Deploy Images to server
  	// 'sftp-deploy': {
		//    build: {
		//     auth: {
		//       host: 'server.com',
		//       port: 22,
		//       authKey: 'key1'
		//     },
		//     cache: 'sftpCache.json',
		//     src: '/path/to/source/folder',
		//     dest: '/path/to/destination/folder',
		//     exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
		//     serverSep: '/',
		//     concurrency: 4,
		//     progress: true
		//   }
		// }

    // Send your email template to Litmus for testing
    litmus: {
    	test: {
    		src: ['dist/index.html'],
    		options: {
          username: 'mallfinder', // Change this
          password: 'pl@cewise', // Change this
          url: 'https://mfnetwork.litmus.com', // Change this
          clients: ['android4', 'aolonline', 'androidgmailapp', 'aolonline', 'ffaolonline',
          'chromeaolonline', 'appmail6', 'iphone4', 'iphone5', 'iphone6', 'ipadmini', 'ipad', 'chromegmailnew',
          'iphone6plus', 'notes85', 'ol2002', 'ol2003', 'ol2007', 'ol2010', 'ol2011',
          'ol2013', 'outlookcom', 'chromeoutlookcom', 'chromeyahoo', 'windowsphone8'] // https://#{company}.litmus.com/emails/clients.xml
        }
      }
    },

    // Copy img files from src to dist
    copy: {
    	main: {
    		expand: true,
    		cwd: '<%= config.src %>/img',
    		src: '**',
    		dest: '<%= config.dist %>/',
    		flatten: true,
    		filter: 'isFile',
    	},
    },

    // remove any previously-created files.
    clean: ['<%= config.dist %>/**/*.{html,txt,xml}']

  });

	grunt.loadNpmTasks('assemble');

	grunt.registerTask('email', [
		'clean',
		'sass',
		'assemble',
		'copy',
		'uncss:dist',
		'processhtml',
		'assemble',
		'premailer',
		'connect:livereload',
		'watch'
	]);

	// Compile and load up your email
	grunt.registerTask('default', ['email']);

 	// Uses `grunt send --template=index.html`
 	grunt.registerTask('send', ['mailgun']);

 	// Uses `grunt litmus --template=index.html`
 	grunt.registerTask('test', ['litmus']);

};
