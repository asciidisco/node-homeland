'use strict';
var gulp = require('gulp');

// task definitions
gulp.task('jshint', require('./gulp-tasks/jshint'));
gulp.task('mocha', require('./gulp-tasks/mocha'));
gulp.task('jsinspect', require('./gulp-tasks/jsinspect'));