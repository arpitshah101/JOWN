var assert = require("chai").assert;

var PreDefTasks = require("../modules/preDefTasks").PreDefTasks;

describe("PreDefTasks", function () {

	describe("#jownprint", function () {
		var tests = [
			{ arg: ["hello"], expected: "hello" },
			{ arg: ["hello", "world"], expected: "hello world" },
			{ arg: ["-al"], expected: "-al" },
			{ arg: null, expected: null },
			{ arg: [], expected: "" },
		];

		tests.forEach(function (test) {
			it("correctly prints the arg array: " + test.arg, function () {
				var res = PreDefTasks.jownprint(test.arg);
				assert.deepEqual(res, test.expected);
			});
		});
	});

});
