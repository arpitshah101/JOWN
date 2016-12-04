var assert = require("assert");
var conditionParser = require("../modules/conditionParser");

describe("ConditionParser", function() {

	describe("#checkCondition", function() {
		var tests = [
			{arg: "banana == boat", expected: ["banana", "==", "boat"]},
			{arg: "123 != 456", expected: ["123", "!=", "456"]}
		];
		
		tests.forEach(function(test) {
			it("checks if " + test.arg + " is a valid condition", function() {
				var res = conditionParser.ConditionParser.prototype.checkCondition(test.arg);
				assert.deepEqual(res, test.expected);
			});
		});
	});

	describe("#isCondition", function() {
        var tests = [
            {arg: "banana == boat", expected: 7},
            {arg: "banana>=boat", expected: 6},
            {arg: "123 != 456", expected: 4},
            {arg: "123 < 345", expected: 4},
            {arg: "<=345", expected: -1},
            {arg: "123<", expected: -1},
            {arg: "==", expected: -1}
        ];

        tests.forEach(function(test) {
            it("correctly finds the index of the condition operator in" + test.arg, function() {
                var res = conditionParser.ConditionParser.prototype.isCondition(test.arg);
                assert.equal(res, test.expected);
            });
        });
	});

});