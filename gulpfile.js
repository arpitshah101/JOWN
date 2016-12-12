const browserify = require("browserify");
const gulp = require("gulp");
const gutil = require("gulp-util");
const mocha = require("gulp-spawn-mocha");
const source = require("vinyl-source-stream");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const watchify = require("watchify");

const tslint = require("gulp-tslint");

const basePaths = {
	bower: "bower_components/",
	dest: "dest/",
	src: "src/",
	tests: "src/test/**",
};

const exec = require("child_process").exec;

function cleanFolder(folderPath) {
	exec("rm -r " + folderPath, (error, stdout, stderr) => {
		if (error) {
			console.error("exec error:"  + error);
			return;
		}
	});
}

/*
	Used to clear the destination folder "dest" before building.
	If errors are encountered, "dest" will not be completely built.
*/
gulp.task("clean-dest", function () {
	cleanFolder(basePaths.dest);
});

/*
	Used to compile all .ts files and place them in the corresponding directory structure within "dest" folder
*/
gulp.task("compile-ts", ["clean-dest"], function () {
	return tsProject.src()
		.pipe(tsProject({
			skipLibCheck: true,
		}))
		.js.pipe(gulp.dest(basePaths.dest));
});

/*
	Copy over public folder & contents without any additional process.
*/
gulp.task("copy-public", function () {
	return gulp.src([basePaths.src + "public/**"], { base: basePaths.src })
		.pipe(gulp.dest(basePaths.dest));
});

gulp.task("copy-tests", function () {
	return gulp.src([basePaths.src + "test/**"], { base: basePaths.src })
		.pipe(gulp.dest(basePaths.dest));
});

gulp.task("test", ["copy-tests", "compile-ts"], function () {
	return gulp
		.src("dest/test/*.js")
		.pipe(mocha({
			R: "spec",
			istanbul: true,
		}));
});

gulp.task("tslint", () => {
	return gulp.src(["**/*.ts", "!**/*.d.ts", "!node_modules/**"])
		.pipe(tslint({
			formatter: "verbose",
		}))
		.pipe(tslint.report({
			emitError: false,
		}));
});

gulp.task("build", ["clean-dest", "compile-ts", "copy-public"]);

gulp.task("default", ["clean-dest", "compile-ts", "copy-tests", "copy-public", "test"], function () {

	// ----------------- USE FOR WHEN PUBLIC FOLDER IS FINALLY OCCUPIED -----------------

	// gulp.watch("src/public/**", function(event) {
	//     cleanFolder(basePaths.dest + "public");
	//     gulp.run("copy-public");
	// });

});