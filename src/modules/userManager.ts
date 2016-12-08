import * as Bluebird from "bluebird";

import * as mongoose from "mongoose";
import * as User from "../models/User";

export class UserManager {

	/**
	 * Creates new User document & saves into the database.
	 *
	 * @param {String} name - Name of user
	 * @param {String} email - User's valid email address
	 * @param {String} userId - Requested userId for authentication
	 * @param {String} password - Requested password for authentication
	 * @param {String[]} roles - Array of permissions for user
	 * @param {Date} [created] - [Optional] Custom creation date for account
	 * @returns {Bluebird<boolean>} - Promise resolving to a boolean flag if successful else promise is rejected
	 *
	 * @memberOf UserManager
	 */
	public createUser(name: String, email: String, userId: String,
					password: String, roles: String[], created?: Date): Bluebird<boolean> {
		return new Bluebird<boolean>((resolve, reject) => {

			this.userExists(userId)
				.then((doc: User.IDocument) => {
					return (doc !== null && doc !== undefined);
				})
				.then((successFlag) => {
					if (successFlag) {
						reject("An account already exists with the provided credentials.");
					}
					else {
						let newUser = new User.model({
							password,
							roles,
							userEmail: email,
							userId,
							userName: name,
						});

						/**
						 * For testing purposes. Allows custom creation date to differentiate users during automated test cases
						 * where users are created nearly simultaneously
						 */
						if (created) {
							newUser.created = created;
						}

						return newUser.save();
					}
				})
				.then((doc) => {
					resolve(true);
				})
				.catch((reason: mongoose.NativeError) => {
					if (reason.name === "MongoError" && reason.message.match("insertDocument.+duplicate\\skey\\serror.*").length > 0) {
						reject("An account already exists with the provided credentials.");
					}
					else {
						console.log(reason);
						reject("Failed to create an account with the provided credentials.");
					}
				});
		});
	}

	/**
	 * Deletes an existing user with the provided userId value
	 *
	 * @param {String} userId - String userId of target user
	 * @returns {Bluebird<boolean>} - Promise resolving to a boolean flag if successful else promise is rejected
	 *
	 * @memberOf UserManager
	 */
	public deleteUser(userId: String): Bluebird<boolean> {
		return new Bluebird<boolean>((resolve, reject) => {
			User.model.findOneAndRemove(userId).exec()
				.then((doc: User.IDocument) => {
					if (doc) {
						resolve(true);
					}
					else {
						reject("User doesn't exist.");
					}
				})
				.catch((reason: any) => {
					reject(reason);
				});
		});
	}

	/**
	 * Modifies an existing user matching the provided userId.
	 * Note: Only email, password, and the roles list can be modified!
	 *
	 * @param {String} userId - String userId of target user
	 * @param {String} email - Valid user email
	 * @param {String} password - Valid requested user password
	 * @param {String[]} roles - List of roles for user. ** Empty list indicates no change should be made. **
	 * @returns {Bluebird<boolean>} - Promise resolving to a boolean flag if successful else promise is rejected
	 *
	 * @memberOf UserManager
	 */
	public modifyUser(userId: String, email: String, password: String, roles: String[]): Bluebird<boolean> {
		return new Bluebird<boolean>((resolve, reject) => {
			let query = {
				userId,
			};

			let update = {
				userEmail: email,
				password,
				roles,
			};

			User.model.findOneAndUpdate(query, update, { new: true }).exec()
				.then((doc: User.IDocument) => {
					if (doc) {
						resolve(true);
					}
					else {
						reject(`No user exists with the provided userId: ${userId}`);
					}
				});
		});
	}

	/**
	 * Verifies whether the user exists or not with the provided userId
	 *
	 * @param {String} userId - UserId string for target user
	 * @returns {Bluebird<User.IDocument>} - Promise resolving to a User Document if user exists, otherwise null
	 *
	 * @memberOf UserManager
	 */
	public userExists(userId: String): Bluebird<User.IDocument> {
		let query = User.model.findOne({ userId }).exec();
		return query.then((doc: User.IDocument) => {
			return Bluebird.resolve(doc);
		});
	}

	/**
	 * Returns a list of the next ten users created after the provided Date/Time
	 *
	 * @param {Date} created - Date object representing the lower boundary of user creation values for next ten users
	 * @returns {Bluebird<User.IUser[]>} - Promise resolving to a list of User Documents for the next ten users
	 *
	 * @memberOf UserManager
	 */
	public getNextTenUsers(created: Date): Bluebird<User.IUser[]> {
		return new Bluebird<User.IUser[]>((resolve, reject) => {
			User.model
				.find({})
				.exec()
				.then((response) => {
					return User.model
						.find({ created: { $gt: created } })
						.limit(10)
						.sort("created")
						.exec();
				}).then((doc) => {
					resolve(doc);
				})
				.catch((reason) => {
					reject(reason);
				});
		});
	}

	/**
	 * Returns the number of users registered within the overall J.O.W.N. system instance
	 *
	 * @returns {Bluebird<number>} - integer number value representing number of users registered
	 *
	 * @memberOf UserManager
	 */
	public getUserCount(): Bluebird<number> {
		return new Bluebird<number>((resolve, reject) => {
			User.model.count({}).exec()
				.then((response) => {
					resolve(response);
				})
				.catch((reason) => {
					reject(reason);
				});
		});
	}
}
