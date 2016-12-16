import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";
// tslint:disable-next-line:no-var-requires
let nodemailer = require("nodemailer");

import * as Form from "../models/Form";
import * as FormData from "../models/FormData";
import * as Instance from "../models/Instance";
import * as User from "../models/User";

import { DataManager } from "../modules/dataManager";
import { InstanceManager } from "../modules/instanceManager";
import { UserManager } from "../modules/userManager";

// tslint:disable-next-line:max-line-length
let transporter = nodemailer.createTransport("smtps://aps180%40scarletmail.rutgers.edu:qzcbbhvucayticyj@smtp.gmail.com");

export class PreDefTasks {

	public static jownprint(args?: string[]): string {
		if (!args) {
			return null;
		}
		let output: string = args.reduce(
			(prev: string, curr: string) => prev.concat((prev.length > 0) ? " " + curr : curr), "");
		output.substring(0, output.length - 1);
		// console.log(output);
		return output;
	}

	public static assign(instanceId: mongoose.Types.ObjectId, formAlias: string,
								userId: string, role: string, ...extraParams: any[]): Bluebird<boolean> {

		/**
		 * verify instanceId, formAlias & userId are valid
		 * 
		 * Retrieve instance, formdata & userDoc
		 * 
		 * add user as member to instance with provided role
		 * assign form to user
		 * email user.email to notify he/she has been assigned the form formName
		 */

		let instance: Instance.IDocument;
		let formData: FormData.IDocument;
		let user: User.IDocument;

		// console.log(`Received command to assign ${formAlias} to ${userId}`);

		return new Bluebird<boolean>((resolve, reject) => {
			// search for instance
			InstanceManager.getInstance({ _id: instanceId })
				.then((instanceDoc: Instance.IDocument): void => {
					// verify instance exists given instanceId
					if (!instanceDoc) {
						reject(`No workflow instance found with the given instanceId: ${instanceId}`);
					}
					else {
						// keep track of instance
						instance = instanceDoc;
					}
				})
				.then((): Bluebird<FormData.IDocument> => {
					// get form data
					return FormData.model.findOne({ instanceId, alias: formAlias }).exec();
				})
				.then((formDataDoc: FormData.IDocument) => {
					// verify form exists
					if (!formDataDoc) {
						reject(`No form found with the given instanceId: ${instanceId} and form alias: ${formAlias}`);
					}
					else {
						formData = formDataDoc;
					}
				})
				.then((): Bluebird<User.IDocument> => this.getTargetUser(userId, instanceId))
				.then((userDoc: User.IDocument): Bluebird<Instance.IDocument> => {
					if (!userDoc) {
						reject(`No user found with the given userId: ${userId}`);
					}
					else {
						user = userDoc;
						return InstanceManager.addInstanceMember(instance, userDoc, role);
					}
				})
				.then(() => {
					formData.assignedTo = user._id;
				})
				.then(() => {
					this.email(user.userEmail, `You've been assigned a new form on your ${role} account. Please check the system.`);
				})
				.catch((reason) => {
					console.error(reason);
					reject(reason);
				});
		});
	}

	public static email(sendTo: string, message: string, instanceId?: mongoose.Types.ObjectId) {
		Bluebird.resolve()
			.then(() => {
				if (sendTo.indexOf("USERS.") > -1 || sendTo.indexOf("INSTANCE.") > -1) {
					return new Bluebird<string>((resolve, reject) => {
						this.getTargetUser(sendTo, instanceId)
							.then((user: User.IDocument) => {
								resolve(user.userEmail);
							});
					});
				}
				else {
					return sendTo;
				}
			})
			.then((emailAddr: string) => {
				// setup e-mail data with unicode symbols
				let mailOptions = {
					from: "'J.O.W.N. Instance 007' <arpitshah101@gmail.com>",
					subject: "Notification from the J.O.W.N. System",
					text: message,
					to: emailAddr,
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						return console.error(error);
					}
					// console.log(`Email sent to ${emailAddr} with the following message:\n\t${message}\nResponse: ${info.response}`);
				});
				// console.log(`Email would be sent to ${emailAddr} with the following message:\n\t${message}`);
			});

	}

	public static save(forms: string, userId: string, instanceId: mongoose.Types.ObjectId) {

		let formNames = forms.split("+");
		let output: string;
		Bluebird.reduce(formNames, (total: string, current: string) => {
			return new Bluebird<string>((resolve, reject) => {
				this.getFormAsJsonStr(current, instanceId)
					.then((str: string) => {
						total += "\n\n" + str;
						resolve(total);
					});
			});
		}, "")
			.then((jsonString: string) => {
				output = jsonString;
			})
			.then(() => {
				return this.getTargetUser(userId, instanceId);
			})
			.then((user: User.IUser) => {
				this.email(user.userEmail, output);
			});
	}

	private static getTargetUser(userId: string, instanceId: mongoose.Types.ObjectId): Bluebird<User.IDocument> {
		// console.log(`Trying to find a user based on ${userId}`);
		return new Bluebird<User.IDocument>((resolve, reject) => {
			if (userId.indexOf("USERS.") > -1) {
				UserManager.getUser({userId: userId.substring(userId.indexOf("USERS.") + 6)})
					.then((user: User.IDocument) => {
						// console.log(`User found as ${JSON.stringify(user)}`);
						resolve(user);
					});
			}
			else if (userId === "INSTANCE.creator") {
				InstanceManager.getInstance({ _id: instanceId })
					.then((instance: Instance.IDocument) => {
						return instance.creator;
					})
					.then((userObjectId: mongoose.Types.ObjectId) => {
						return UserManager.getUser({ _id: userObjectId });
					})
					.then((user: User.IDocument) => {
						// console.log(`Found instance creator to be ${user.userId}`);
						resolve(user);
					});
			}
			else {
				let formName = userId.substring(0, userId.indexOf("."));
				let propName = userId.substring(userId.indexOf(".") + 1);

				// console.log(`Attempting to find a user corresponding to ${propName} in form ${formName}`);

				DataManager.getFormData(instanceId, formName)
					.then((formObject: any) => {
						// tslint:disable-next-line:no-eval
						// return eval("formObject." + propName);
						// tslint:disable-next-line:no-string-literal
						// console.log(`\n\n${JSON.stringify(formObject.data)}\n\n`);
						return formObject.data[propName];
					})
					.then((value: string) => {
						// console.log(`${userId} evaluated to ${value}`);
						// console.log(`\tTrying to find user with userId: ${value}`);
						return UserManager.getUser({userId: value});
					})
					.then((user: User.IDocument) => {
						// console.log(`Found a user from userId: ${userId} as ${user.userId}`);
						resolve(user);
					});
			}
		});
	}

	private static getFormAsJsonStr(formAlias: string, instanceId: mongoose.Types.ObjectId) {
		return new Bluebird<string>((resolve, reject) => {
			FormData.model.findOne({ alias: formAlias, instanceId })
				.then((formData: FormData.IDocument) => {
					resolve(JSON.stringify(formData));
				})
				.catch((reason) => {
					console.error(reason);
					resolve("");
				});
		});
	}
}
