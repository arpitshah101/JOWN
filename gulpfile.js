var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var gutil = require("gulp-util");

var basePaths = {
    src: 'src/',
    dest: 'dest/',
    bower: 'bower_components/'
};

var paths = {
    models: basePaths.src + 'models/', 
    pages: ['src/*.html']

};

gulp.task("copy-html", copyHTML);

function copyHTML() {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
}

function compileTs() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
}

function makeDest() {
    copyHTML();
    compileTs();
}

gulp.task("compile-ts", compileTs);
gulp.task("default", ["copy-html", "compile-ts"]);