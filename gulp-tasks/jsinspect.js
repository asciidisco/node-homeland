var gulp = require('gulp');
var jsinspect = require('gulp-jsinspect');

module.exports = function(){
  return gulp.src(['gulpfile.js', 'index.js', 'lib/**/*.js'])
    .pipe(jsinspect());
};