import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";

import * as FormData from "../models/FormData";
import * as Instance from "../models/Instance";

export class DataManager {

	public static getFormData(instanceId: mongoose.Types.ObjectId, formAlias: string): Bluebird<FormData.IDocument> {
		return new Bluebird<FormData.IDocument>((resolve, reject) => {
			FormData.model.findOne({instanceId, alias: formAlias}).exec()
				.then((formDataDoc: FormData.IDocument) => {
					if (formDataDoc) {
						return formDataDoc.execPopulate();
					}
					else {
						reject("No form data found with the provided instanceId & form alias.");
					}
				})
				.then((formDataDoc: FormData.IDocument) => {
					resolve(formDataDoc);
				})
				.catch((reason) => {
					console.error(reason);
					reject(reason);
				});
		});
	}

	public static saveFormData(instanceId: mongoose.Types.ObjectId, formAlias: string, dataObj: any): Bluebird<boolean> {
		return new Bluebird<boolean>((resolve, reject) => {
			FormData.model.findOne({instanceId, alias: formAlias}).exec()
				.then((formDataDoc: FormData.IDocument) => {
					if (formDataDoc) {
						formDataDoc.data = dataObj;
						formDataDoc.lastEdited = new Date(Date.now());
						formDataDoc.status = "submitted";
						return formDataDoc.save();
					}
					else {
						reject(`No form data found for the provided instanceId & form alias.`);
					}
				})
				.then((formDataDoc) => {
					resolve(true);
				})
				.catch((reason) => {
					console.error(reason);
					reject(reason);
				});
		});
	}

	public static getInstanceData(instanceId: mongoose.Types.ObjectId): Bluebird<Instance.IDocument> {
		return new Bluebird<Instance.IDocument>((resolve, reject) => {
			Instance.model.findOne({_id: instanceId}).exec()
				.then((instanceDoc: Instance.IDocument) => {
					if (instanceDoc) {
						return instanceDoc.execPopulate();
					}
					else {
						reject(`No workflow instance found with the provided instanceId: ${instanceId.toString()}`);
					}
				})
				.then((instanceDoc: Instance.IDocument) => {
					resolve(instanceDoc);
				})
				.catch((reason) => {
					console.error(reason);
					reject(`An error occurred while searching for a workflow instance with the instanceId: ${instanceId.toString()}`);
				});
		});
	}

	public static getDataFromFormExp(expression: string, instanceId: mongoose.Types.ObjectId): Bluebird<string> {
		return new Bluebird<string>((resolve, reject) => {
			let formName = expression.substring(0, expression.indexOf("."));
			let propName = expression.substring(expression.indexOf(".") + 1);

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
					// console.log(`${expression} evaluated to ${value}`);
					resolve(value);
				});
		});
	}
}
