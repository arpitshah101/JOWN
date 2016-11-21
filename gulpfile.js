var browserify = require("browserify");
var gulp = require("gulp");
var gutil = require("gulp-util");
var mocha = require('gulp-spawn-mocha');
var source = require('vinyl-source-stream');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var watchify = require("watchify");

var basePaths = {
    src: 'src/',
    dest: 'dest/',
    bower: 'bower_components/',
    tests: 'src/test/**'
};

var exec = require('child_process').exec;

function cleanFolder(folderPath) {
    exec('rm -r ' + folderPath, function (error, stdout, stderr) {
        if (error) {
            console.error('exec error: ' + error);
            return;
        }
    });

}

/*
    Used to clear the destination folder "dest" before building.
    If errors are encountered, "dest" will not be completely built.
*/
gulp.task("clean-dest", function() {
    cleanFolder(basePaths.dest);
});

/*
    Used to compile all .ts files and place them in the corresponding directory structure within "dest" folder
*/
gulp.task("compile-ts", ['clean-dest'], function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(basePaths.dest));
});

/*
    Copy over public folder & contents without any additional process.
*/
gulp.task("copy-public", function() {
    return gulp.src([basePaths.src + 'public/**'], {base: basePaths.src})
        .pipe(gulp.dest(basePaths.dest));
});

gulp.task("copy-tests", function() {
    return gulp.src([basePaths.src + 'test/**'], {base: basePaths.src})
        .pipe(gulp.dest(basePaths.dest));
});

gulp.task('test', ['copy-tests', 'compile-ts'], function() {
  return gulp
    .src("dest/test/*.js")
    .pipe(mocha({
        R: 'spec',
        istanbul: true
    }));
});

gulp.task("default",['clean-dest', 'compile-ts', 'copy-tests', 'copy-public', 'test'], function() {

    // ----------------- USE FOR WHEN PUBLIC FOLDER IS FINALLY OCCUPIED -----------------
    
    // gulp.watch('src/public/**', function(event) {
    //     cleanFolder(basePaths.dest + 'public');
    //     gulp.run('copy-public');
    // });

});