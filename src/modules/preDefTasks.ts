import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";
// tslint:disable-next-line:no-var-requires
let nodemailer = require("nodemailer");

import * as Form from "../models/Form";
import * as FormData from "../models/FormData";
import * as Instance from "../models/Instance";
import * as User from "../models/User";

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
		console.log(output);
		return output;
	}

	public static assignForm(instanceId: mongoose.Types.ObjectId, formAlias: string,
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
				.then((): Bluebird<User.IDocument> => UserManager.getUser({ userId, roles: role }))
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
					this.jownemail(user.userEmail, `You've been assigned a 
						new form on your ${role} account. Please check the system.`);
				})
				.catch((reason) => {
					console.error(reason);
					reject(reason);
				});
		});
	}

	public static jownemail(sendTo: string, message: string) {
		// setup e-mail data with unicode symbols
		let mailOptions = {
			from: "'J.O.W.N. Instance 007' <arpitshah101@gmail.com>",
			subject: "Notification from the J.O.W.N. System",
			text: message,
			to: sendTo,
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.error(error);
			}
			console.log(`Email sent to ${sendTo} with the following message:\n\t${message}\nResponse: ${info.response}`);
		});
	}
}
