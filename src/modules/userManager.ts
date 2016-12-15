import * as Bluebird from "bluebird";

import * as mongoose from "mongoose";
import * as Group from "../models/Group";
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
	public static createUser(name: string, email: string, userId: string,
					password: string, roles: string[], created?: Date): Bluebird<boolean> {
		return new Bluebird<boolean>((resolve, reject) => {
			let newUser: User.IDocument;
			User.model.findOne({ userId })
				.then((doc: User.IDocument) => {
					return (doc !== null && doc !== undefined);
				})
				.then((successFlag) => {
					if (successFlag) {
						reject("An account already exists with the provided credentials.");
					}
					else {
						newUser = new User.model({
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
					newUser = doc;
					let groupPromises: Array<Bluebird<Group.IDocument>> = [];
					for (let group of doc.roles) {
						groupPromises.push(Group.model.findOne({name: group}).exec());
					}
					return Bluebird.all(groupPromises);
				})
				.then((groups: Group.IDocument[]) => {
					groups = groups.filter((doc: Group.IDocument) => {
						if (doc) {
							doc.members.push(newUser._id);
							return true;
						}
						return false;
					});
					return Bluebird.all(groups.map((doc: Group.IDocument) => doc.save()));
				})
				.then((groups: Group.IDocument[]) => {
					let missingGroups: string[] = newUser.roles.filter((role: string) => {
						return !groups.some((group: Group.IDocument) => group.name === role);
					});
					return Bluebird.all(this.addNewGroups(missingGroups, newUser._id));
				})
				.then((newGroups: Group.IDocument[]) => {
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
	public static deleteUser(userId: String): Bluebird<boolean> {
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
	 * @param {string} userId - String userId of target user
	 * @param {string} email - Valid user email
	 * @param {string} password - Valid requested user password
	 * @param {string[]} roles - List of roles for user. ** Empty list indicates no change should be made. **
	 * @returns {Bluebird<boolean>} - Promise resolving to a boolean flag if successful else promise is rejected
	 *
	 * @memberOf UserManager
	 */
	public static modifyUser(userId: string, email?: string, password?: string, roles?: string[]): Bluebird<boolean> {
		return new Bluebird<boolean>((resolve, reject) => {
			let query = {
				userId,
			};

			let update: any = { };
			if (email) {
				update.userEmail = email;
			}
			if (password) {
				update.password = password;
			}
			if (roles) {
				update.roles = roles;
			}


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
	public static userExists(userId: string, password: string, role: string): Bluebird<User.IDocument> {
		return new Bluebird<User.IDocument>((resolve, reject) => {
			console.log(`UserId: ${userId}, Password: ${password}, Role: ${role}`);
			User.model.findOne({ userId, password, roles: role})
				.exec()
				.then((doc: User.IDocument) => {
					resolve(doc);
				});
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
	public static getNextTenUsers(created: Date): Bluebird<User.IUser[]> {
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
	public static getUserCount(): Bluebird<number> {
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

	/**
	 * Wrapper function to retrieve any given user based on provided query object
	 * ** purely for object oriented design **
	 * 
	 * @static
	 * @param {any} queryObj
	 * @returns {Bluebird<User.IDocument>}
	 * 
	 * @memberOf UserManager
	 */
	public static getUser(queryObj): Bluebird<User.IDocument> {
		return User.model.findOne(queryObj).exec();
	}

	private static addNewGroups(groups: string[], userDocId: mongoose.Types.ObjectId): Array<Bluebird<Group.IDocument>> {
		let newGroups: Array<Bluebird<Group.IDocument>> = [];
		groups.forEach((value: string) => {
			let g = new Group.model(<Group.IGroup> {
				members: [userDocId],
				name: value,
				public: false,
			});
			newGroups.push(g.save());
		});
		return newGroups;
	}
}
