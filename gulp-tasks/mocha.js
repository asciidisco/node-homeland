'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');

module.exports =  function () {
  return gulp.src('test/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}));
};