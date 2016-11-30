var assert = require("assert");

var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost:27017/jown-test');

var DataManager = require("../modules/dataManager").DataManager.prototype;
var Data = require("../models/Data").model;

describe('DataManager', function () {

	var testData = {
		data: {
			lines: [
				"Three Rings for the Elven-kings under the sky,",
				"Seven for the Dwarf-lords in their halls of stone,",
				"Nine for Mortal Men doomed to die,",
				"One for the Dark Lord on his dark throne",
				"In the Land of Mordor where the Shadows lie.",
				"One Ring to rule them all, One Ring to find them,",
				"One Ring to bring them all and in the darkness bind them",
				"In the Land of Mordor where the Shadows lie.",
			]
		},
		formName: "Ring Description",
		instanceId: 'JRRT1945'
	};

	beforeEach(function (done) {
		//add some test data    
		var testDataModel = new Data(testData);
		testDataModel.save().then(function (doc) {
			done();
		});
	});

	afterEach(function (done) {
		Data.remove({}, function () {
			done();
		});
	});

	describe('#getData', function () {
		it('correctly gets test form data', function (done) {
			DataManager.getData(testData.instanceId, testData.formName)
				.then(function (response, reject) {
					assert.deepEqual(response.data, testData.data);
					done();
				});
		});

		it('returns Promise<null> when data does not exist', function(done) {
			DataManager.getData("One ring to rule them all", "one ring to find them")
				.then(function(response, reject) {
					assert.equal(response, null);
					done();
				});
		});
	});

	describe("#saveData", function() {
		it('should return Promise<true> if existing data is updated successfully', function (done) {
			DataManager.saveData(testData.instanceId, testData.formName, testData.data)
				.then(function (response, reject) {
					assert.deepEqual(response, true);
					done();
				});
		});

		it('should return Promise<true> if new data is saved successfully', function (done) {
			DataManager.saveData("RandomId", "RandomName", "One ring")
				.then(function (response, reject) {
					assert.deepEqual(response, true);
					done();
				});
		});

		//Not implemented yet
		it('should return Promise<false> if new data is not saved successfully');
		
	});
});