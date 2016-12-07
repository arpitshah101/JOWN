var assert = require("assert");

var conditionParser = require("../modules/conditionParser");

describe("ConditionParser", function() {

	describe("#deconstructCondition", function() {
		var tests = [
			{arg: "testin && testenin", expected: ["testin", "&&", "testenin"]},
			{arg: " this && isa || test     ", expected: ["this", "&&", "isa", "||", "test"]},
			{arg: "  tis && teh || test ||", expected: undefined},
			{arg: " another && (test || to) || test", expected: ["another", "&&", ["(", "test", "||", "to", ")"], "||", "test"]},
			{arg: " testing &&&& to || getundefined", expected: undefined}
		];

		tests.forEach(function(test) {
			it("deconstructs condition " + test.arg, function() {
				var res = conditionParser.ConditionParser.prototype.deconstructCondition(test.arg);
				assert.deepEqual(res, test.expected);
			});
		});
	});

	describe("#checkCondition", function() {
		var tests = [
			{arg: "banana == boat", expected: ["banana", "==", "boat"]},
			{arg: "123 != 456", expected: ["123", "!=", "456"]}
		];

		tests.forEach(function(test) {
			it("checks if " + test.arg + " is a valid condition", function() {
				var res = conditionParser.ConditionParser.prototype.parseCondtion(test.arg);
				assert.deepEqual(res, test.expected);
			});
		});
	});

	describe("#isCondition", function() {
		var tests = [
			{arg: "banana == boat", expected: 7},
			{arg: "banana>=boat", expected: 6},
			{arg: "123 != 456", expected: 4},
			{arg: "123 < 345", expected: -4},
			{arg: "<=345", expected: undefined},
			{arg: "123<", expected: undefined},
			{arg: "==", expected: undefined}
		];

		tests.forEach(function(test) {
			it("correctly finds the index of the condition operator in " + test.arg, function() {
				var res = conditionParser.ConditionParser.prototype.isCondition(test.arg);
				assert.equal(res, test.expected);
			});
		});
	});

});
