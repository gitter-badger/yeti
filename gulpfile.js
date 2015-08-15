var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');

gulp.task('concat', function() {
    return gulp.src('./client/javascript/app/**/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./client/javascript/dist'));
});

gulp.task('minify', function() {
    gulp.src('./client/javascript/dist/all.js')
        .pipe(minify())
        .pipe(gulp.dest('./client/javascript/dist'))
});

gulp.task('uglify', function() {
    return gulp.src('./client/javascript/dist/all.js')
        .pipe(uglify())
        .pipe(gulp.dest('./client/javascript/dist/'));
});