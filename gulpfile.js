var gulp = require('gulp'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
	rename = require('gulp-rename');
gulp.task('taskLess', function(){
	gulp.src('src/less/*.less')
		.pipe(less())
		.pipe(minifycss())
		.pipe(rename({
			suffix : '.min'
		}))
		.pipe(gulp.dest('src/css/'));
});

gulp.task('minJs', function(){
	gulp.src('src/js/*.js')
		.pipe(uglify())
		.pipe(rename({suffix : '.min'}))
		.pipe(gulp.dest('src/min_js/'));
});
gulp.task('startWatch', function(){
	gulp.watch('src/less/*.less', ['taskLess']);
	gulp.watch('src/js/*.js', ['minJs']);
});
