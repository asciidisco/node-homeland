'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

module.exports = function gulpJSHint() {
  return gulp
    .src(['gulpfile.js', 'index.js', 'lib/**/*.js', 'gulp-tasks/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
};