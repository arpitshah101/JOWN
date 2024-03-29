var assert = require("assert");
var Promise = require("bluebird");

var TaskRunner = require("../modules/taskRunner").TaskRunner;

describe("TaskRunner", function () {

	describe("#checkIfPreDef", function () {
		var tests = [
			{ arg: "jownprint", expected: true },
			{ arg: "FUNCTION DNE", expected: false }, // test function which doesn't exist
		];

		tests.forEach(function (test) {
			it("correctly checks whether " + test.arg + " is present in PreDefTasks", function () {
				var res = TaskRunner.checkIfPreDef(test.arg);
				assert.equal(res, test.expected);
			});
		});
	});

	describe("#tokenizeCommand", function () {
		var tests = [
			{ arg: "jownprint  hello", expected: ["jownprint", "hello"] },
			{ arg: "email \"Hello \"", expected: ["email", "\"Hello \""] },
		];

		tests.forEach(function (test) {
			it("correctly checks whether " + test.arg + " is tokenized correctly", function () {
				var res = TaskRunner.tokenizeCommand(test.arg);
				assert.deepEqual(res, test.expected);
			});
		});
	});

	describe("#run", function () {
		var tests = [
			{ arg: "jownprint hello", expected: "hello" },
			{ arg: "email \"Hello \"", expected: 1 },
			{ arg: "ls -al", expected: 0 },
			{ arg: "echo \"hello Professor Borgida!\"", expected: 0 },
		];

		tests.forEach(function (test) {
			it("correctly runs " + test.arg + " function", function (done) {
				var res = TaskRunner.run(test.arg);
				res.then(function (resolve, reject) {
					assert.deepEqual(resolve, test.expected);
					done();
				})
				.catch((reason) => {
					console.error(reason);
					done();
				});
			});
		});
	});

});
