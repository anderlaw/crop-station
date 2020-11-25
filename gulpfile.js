const babel = require('gulp-babel');  

const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const uglify = require('gulp-uglify');
const minifycss=require('gulp-minify-css');
const rename = require('gulp-rename');
const { series ,src, dest } = require('gulp');
const gulp = require('gulp');


function toEs5AndUglify(){
    return src('src/*.js')
    .pipe(babel())
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('dist'));
}
function sasstoCssAndUglify(){
    return src('src/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(minifycss())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('dist'));
}


exports.build = series(toEs5AndUglify,sasstoCssAndUglify);
