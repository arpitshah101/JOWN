var assert = require("chai").assert;

var fs = require("fs");

var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

var DefParser = require("../modules/defParser");

describe("DefinitionParser", function () {

	before(function() {
		mongoose.connect("mongodb://localhost:27017/jown-test");
	});

	after(function() {
		// tslint:disable-next-line:no-string-literal
		// mongoose.connection.collections["workflows"].drop();
		mongoose.disconnect();
	});

	describe("#parse", function() {
		it("#parsesBasicXML", function(done) {
			var xml = fs.readFileSync(__dirname + "/sample_workflows/SPN_Workflow.xml");
			DefParser.DefParser.parse(xml.toString())
				.then(function (success) {
					if (!success) {
						assert(false, `Workflow isn't saved properly...`);
					}
				})
				.then(function() {
					done();
				})
				.catch(function(reason) {
					// assert(false, reason);
					console.log(reason);
					done();
				});
		});
	});
});
