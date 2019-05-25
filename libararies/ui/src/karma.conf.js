const CI = process.env.CI || false;
const SINGLE_RUN = process.env.KARMA_SINGLE_RUN || false;

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../coverage/library-ui'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
    },
    reporters: ['progress', 'kjhtml'],
    port: 9870,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !CI,
    browsers: CI ? ['Firefox'] : ['Chrome'],
    singleRun: CI || SINGLE_RUN,
    restartOnFileChange: true,
  });
};
