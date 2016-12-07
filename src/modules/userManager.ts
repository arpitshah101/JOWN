import * as Bluebird from "bluebird";

import * as mongoose from "mongoose";
import * as User from "../models/User";

export class UserManager {

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

	public userExists(userId: String): Bluebird<User.IDocument> {
		let query = User.model.findOne({ userId }).exec();
		return query.then((doc: User.IDocument) => {
			return Bluebird.resolve(doc);
		});
	}

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
