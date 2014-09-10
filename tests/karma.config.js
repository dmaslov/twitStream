// Karma configuration
// Generated on Mon May 19 2014 18:25:16 GMT+0300 (EEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        '../public/components/angular/angular.js',
        '../public/components/angular-route/angular-route.js',
        '../public/components/angular-sanitize/angular-sanitize.js',
        '../public/components/angular-animate/angular-animate.js',
        '../public/components/angular-local-storage/angular-local-storage.js',
        '../public/components/angular-mocks/angular-mocks.js',
        '../public/js/**/*.js',
        './helpers.js',
        './unit/**/*.js',
        '../views/partial/tweet_template.html'
    ],


    // list of files to exclude
    exclude: [
        '../public/js/*.min.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        '../public/js/controllers/favorites.js': ['coverage'],
        '../public/js/controllers/stream.js': ['coverage'],
        '../public/js/services/socket.js': ['coverage'],
        '../public/js/services/storage.js': ['coverage'],
        '../public/js/services/streamstatus.js': ['coverage'],
        '../public/js/services/tweet.js': ['coverage'],
        '../views/partial/tweet_template.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      'moduleName': 'Templates',

      // Function that transforms the path to look exactly like
      // you have it in templateUrl in your Angular code
      //
      // Mine looks like this
      cacheIdFromPath: function(filepath) {
        return filepath.match(/\/partial\/.*/)[0];
      }
    },

    coverageReporter: {
        type : 'html',
        dir : 'coverage/'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'html', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
