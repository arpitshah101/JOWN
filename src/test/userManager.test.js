var assert = require("assert");

var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');

mongoose.createConnection('mongodb://localhost:27017/jown-test');

var UserManager = require("../modules/userManager").UserManager.prototype;
var User = require("../models/User").model;

describe('UserManager', function () {

	var testUser = {
        userName: "JohnSmith",
        userEmail: "johnsmith@gmail.com",
        userId: "123",
		password: "abc123",
		roles: ["Professor"]
	};

	describe('#createUser', function () {
		it('successfully creates a user', function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response, reject) {
                    assert.deepEqual(response, true);
                    User.remove();
					done();
				});
                //User.remove();
		});

        //User.remove();

		it('unable to create a user', function (done) {
            UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles);
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response, reject) {
					assert.deepEqual(response, false);
                    User.remove();
					done();
				});
                User.remove();
		});

        //User.remove();

	});

    describe('#deleteUser', function () {
		it('successfully deletes a user', function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles);
            UserManager.deleteUser(testUser.userId)
				.then(function (response, reject) {
                    assert.deepEqual(response, true);
                    User.remove();
					done();
				});
                //User.remove();
		});

        User.remove();

		it('unable to delete a user', function (done) {
            UserManager.deleteUser(testUser.userId)
				.then(function (response, reject) {
                    assert.deepEqual(response, false);
					done();
				});
		});
	});
    
    describe('#modifyUser', function () {
		it('successfully modifies a user', function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles);
            let newRoles = ["newRole1", "newRole2"];
            UserManager.modifyUser(testUser.userId, "newEmail@gmail.com", "newPassword", newRoles)
				.then(function (response, reject) {
                    assert.deepEqual(response, true);
                    User.remove();
					done();
				});
                //User.remove();
		});

        User.remove();

		it('unable to modify a user', function (done) {
            let newRoles = ["newRole1", "newRole2"];
			UserManager.modifyUser(testUser.userId, "newEmail@gmail.com", "newPassword", newRoles)
				.then(function (response, reject) {
					assert.deepEqual(response, false);
					done();
				});
		});
	});

});