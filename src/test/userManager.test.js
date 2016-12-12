var assert = require("chai").assert;

var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var bluebird = require("bluebird");

var UserManager = require("../modules/userManager").UserManager.prototype;
var User = require("../models/User").model;

describe("#UserManager", function () {

	before(function() {
		mongoose.connect("mongodb://localhost:27017/jown-test");
	});

	after(function() {
		mongoose.disconnect();
	});

	var testUser = {
		created: new Date(Date.now()),
		password: "abc123",
		roles: ["Professor"],
		userEmail: "johnsmith@gmail.com",
		userId: "123",
		userName: "JohnSmith",
	};

	afterEach(function (done) {
		User.findOne({ userId: testUser.userId }, function (err, result) {
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

	describe("#createUser", function () {
		it("successfully creates a user when account doesn't already exist", function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response) {
					// only passes assert if param is truthy
					assert(response);
					done();
				},
				function (reject) {
					assert(false, "This fails for no reason. Check it out!\n" + reject);
					done();
				});
		});

		it("#unable to create a user when with existing account", function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response) {
					assert.equal(response, true);
					return UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId,
							testUser.password, testUser.roles);
				})
				.then(function (response) {
					assert(false, "shouldn't get be getting here...");
					done();
				})
				.catch(function (reason) {
					assert.equal(reason, "An account already exists with the provided credentials.");
					done();
				});
		});
	});

	describe("#deleteUser", function () {
		it("#successfully deletes existing user", function (done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response) {
					return UserManager.deleteUser(testUser.userId);
				})
				.then(function (response) {
					assert.equal(response, true);
					done();
				}, function (reject) {
					assert.equal(reject, false);
					done();
				});
		});

		it("#unable to delete non-existing user", function (done) {
			UserManager.deleteUser(testUser.userId)
				.then(function (response) {
					assert(false, "Attempts to delete non-existing user and returns success.");
					done();
				})
				.catch(function (reason) {
					assert.equal(reason, "User doesn't exist.");
					done();
				});
		});
	});

	describe("#getNextTenUsers", function () {
		it("#successfully gets the next 1-10 users", function (done) {
			// this.timeout(50000);
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response) {
					return UserManager.getUserCount();
				})
				.then(function (userCount) {
					assert.equal(userCount, 1);
				})
				.then(function (result) {
					return UserManager.createUser(
						testUser.userName, "newEmail@gmail.com", "newUserId", "newPassword",
						testUser.roles, new Date(Date.now() + 5000));
				})
				.then(function (response) {
					return UserManager.getUserCount();
				})
				.then(function (userCount) {
					assert.equal(userCount, 2);
				})
				.then(function (response) {
					return UserManager.getNextTenUsers(testUser.created);
				})
				.then(function (response) {
					assert.isTrue(Array.isArray(response));
					assert.lengthOf(response, 1);
					done();
				})
				.catch(function (reason) {
					console.log(reason);
					assert.fail(undefined, undefined, reason);
					done();
				});
		});
	});

	describe("#modifyUser", function () {
		it("#successfully modifies an existing user", function (done) {
			let newRoles = ["newRole1", "newRole2"];
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response) {
					return UserManager.modifyUser(testUser.userId, "newEmail@gmail.com", "newPassword", newRoles);
				})
				.then(function (response) {
					assert.deepEqual(response, true);
					done();
				},
				function (reject) {
					assert.deepEqual(reject, false);
					done();
				});
		});

		it("#unable to modify a non-existing account", function (done) {
			let newRoles = ["newRole1", "newRole2"];
			UserManager.modifyUser(testUser.userId, "newEmail@gmail.com", "newPassword", newRoles)
				.then(function (response) {
					assert(false, "Shouldn't be able to update a non-existing account.");
					done();
				})
				.catch(function (reason) {
					assert.isAbove(reason.indexOf("No user exists with the provided userId: "), -1,
						"No user exists with the provided userId.");
					done();
				});
		});
	});

	describe("#userExists", function () {
		it("#successfully checks that a user exists", function (done) {
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

		it("#successfully checks that a user does not exist", function (done) {
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

	describe("#getUserCount", function () {
		it("#returns 0 when no users exist", function (done) {
			UserManager.getUserCount()
				.then(function (response) {
					assert.equal(response, 0);
					done();
				});
		});

		it("#returns 1 when exactly 1 user exists", function(done) {
			UserManager.createUser(testUser.userName, testUser.userEmail, testUser.userId, testUser.password, testUser.roles)
				.then(function (response) {
					return UserManager.getUserCount();
				})
				.then(function (userCount) {
					assert.equal(userCount, 1);
					done();
				});
		});
	});
});
