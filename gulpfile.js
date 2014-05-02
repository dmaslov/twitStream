var gulp = require('gulp'),
    jsmin = require('gulp-jsmin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    less = require('gulp-less');

var srcPath = './public';
var paths = {
    js: [
            srcPath + '/components/angular/angular.js',
            srcPath + '/components/angular-route/angular-route.js',
            srcPath + '/components/angular-sanitize/angular-sanitize.js',
            srcPath + '/components/angular-animate/angular-animate.js',
            srcPath + '/js/**/*.js',
            '!' + srcPath + '/js/*.min.js'
        ],
    less: [
        srcPath + '/less/*.less'
    ],
    fonts: [
        srcPath + '/components/bootstrap/fonts/*',
    ]
};

gulp.task('js-minifier', function() {
    gulp.src(paths.js)
        .pipe(concat('all.js'))
        .pipe(rename('app.min.js'))
        .pipe(jsmin())
        .pipe(gulp.dest(srcPath + '/js'));
});

gulp.task('less-compile', function() {
    gulp.src(paths.less)
        .pipe(less())
        .pipe(cssmin())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(srcPath + '/css'));
});

gulp.task('fonts-copy', function() {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(srcPath + '/fonts'));
});

gulp.task('watch', function(){
    gulp.watch(paths.js, ['js-minifier']);
    gulp.watch(paths.less, ['less-compile']);
});

gulp.task('default', ['js-minifier', 'less-compile', 'fonts-copy', 'watch']);
