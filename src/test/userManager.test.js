var assert = require("assert");

var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');

//mongoose.connect('mongodb://localhost:27017/jown-test');
mongoose.createConnection('mongodb://localhost:27017/jown-test');

var UserManager = require("../modules/userManager").UserManager.prototype;
var User = require("../models/User").model;

describe('UserManager', function () {

	var testUser = {
        userName: "JohnSmith",
        userEmail: "johnsmith@gmail.com",
        userId: "jsmith",
		password: "abc123",
		roles: ["Professor"]
	};

	beforeEach(function (done) {
		//add some test data    
		var testUserModel = new User(testUser);
        testUserModel.save().then(function(resolve, reject) {
            if (assert.deepEqual(reject, null)) {
                console.log("An error has occurred.");
                done();
            }
        })
        done();
		/*testUserModel.save().then(function (doc) {
			done();
		});*/
	});

	afterEach(function (done) {
		User.remove({}, function () {
			done();
		});
	});

	describe('#createUser', function () {
		it('successfully creates a user', function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response, reject) {
					assert.deepEqual(response, true);
					done();
				});
		});

		it('unable to create a user', function (done) {
            UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response, reject) {
					assert.deepEqual(response, false);
					done();
				});
		});
	});

	/*describe("#saveData", function() {
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
		
	});*/
});