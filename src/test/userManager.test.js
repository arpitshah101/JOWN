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
		roles: ["Professor"],
		created: new Date(Date.now())
	};

    afterEach(function (done) {
        User.findOne({userId: testUser.userId}, function (err, result) {
            if (result) {
                User.remove({}, function () {
			        done();
		        });
            }
            else {
                done();
            }
	    });
    });

	describe('#createUser', function () {
		it('successfully creates a user', function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response) {
                    assert.deepEqual(response, true);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, false);
					done();
				});
		});

		it('unable to create a user', function (done) {
            UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles))
				.then(function (response) {
                    assert.deepEqual(response, false);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, true);
					done();
				});
		});
	});

    describe('#deleteUser', function () {
		it('successfully deletes a user', function (done) {
            UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(UserManager.deleteUser(testUser.userId))
				.then(function (response) {
                    assert.deepEqual(response, true);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, false);
					done();
				});
		});

		it('unable to delete a user', function (done) {
            UserManager.deleteUser(testUser.userId)
				.then(function (response) {
                    assert.deepEqual(response, false);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, true);
					done();
				});
		});
	});
    
	describe('#getNextTenUsers', function () {
		it('successfully gets the next 1-10 users', function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(UserManager.createUser(testUser.userName, "newEmail@gmail.com", "newUserId", "newPassword", testUser.roles))
				.then(UserManager.getNextTenUsers(testUser.created))
				.then(function (response) {
                    assert.deepEqual(typeof response, typeof [User.User]);
					done();
				},
				function (reject) {
					assert.deepEqual(typeof reject, null);
					done();
				});
		});

		it('unable to get the next 1-10 users', function (done) {
            UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(UserManager.getNextTenUsers(testUser.created))
				.then(function (response) {
                    assert.deepEqual(typeof response, null);
					done();
				},
				function (reject) {
					assert.deepEqual(typeof reject, typeof [User.User]);
					done();
				});
		});
	});

    describe('#modifyUser', function () {
		it('successfully modifies a user', function (done) {
			let newRoles = ["newRole1", "newRole2"];
            UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(UserManager.modifyUser(testUser.userId, "newEmail@gmail.com", "newPassword", newRoles))
				.then(function (response) {
                    assert.deepEqual(response, true);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, false);
					done();
				});
		});

		it('unable to modify a user', function (done) {
            let newRoles = ["newRole1", "newRole2"];
			UserManager.modifyUser(testUser.userId, "newEmail@gmail.com", "newPassword", newRoles)
				.then(function (response) {
					assert.deepEqual(response, false);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, true);
					done();
				});
		});
	});

    describe('#userExists', function () {
		it('successfully checks that a user exists', function (done) {
            UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(UserManager.userExists(testUser.userId))
				.then(function (response) {
                    assert.deepEqual(response, true);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, false);
					done();
				});
		});

		it('successfully checks that a user does not exist', function (done) {
            UserManager.userExists(testUser.userId)
				.then(function (response) {
                    assert.deepEqual(response, null);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, testUser);
					done();
				});
		});
	});
});