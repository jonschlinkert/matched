var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
require('jshint-stylish');

gulp.task('coverage', function () {
  return gulp.src(['index.js', 'utils.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function () {
  return gulp.src('test.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports());
});

gulp.task('jshint', function () {
  return gulp.src(['index.js', 'utils.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', ['mocha', 'jshint']);
