// promise-bluebird.d.ts
import * as Bluebird from "bluebird";

import * as Data from "../models/Data";

import * as mongoose from "mongoose";

export class DataManager {

	public getData(instanceId: String, formName?: String): Bluebird<Data.IDocument> {
		return new Bluebird<Data.IDocument>((resolve, reject) => {
			Data.model.findOne({instanceId, formName}).exec().
				then((doc: Data.IDocument) => {
					if (doc) {
						resolve(doc);
					}
					else {
						resolve(null);
					}
				})
				.catch((reason: any) => {
					reject(reason);
				});
		});
	}

	public saveData(instanceId: string, formName: string, dataObj: Object): Bluebird<boolean> {
		// if so, update & save
		//      return true
		// else save new doc
		//      return true

		// query to check if doc exists for <instanceId, formName?>
		return new Bluebird<boolean>((resolve, reject) => {
			this.getData(instanceId, formName).
				then((doc: Data.IDocument) => {
					if (doc) {
						doc.data = dataObj;
						doc.save().then(
							(docmt: Data.IDocument) => resolve(true),
							(reason: any) => resolve(false),
						);
					}
					else {
						let newData = new Data.model({
							data: dataObj,
							formName,
							instanceId,
						});
						newData.save().then(
							(docmt: Data.IDocument) => resolve(true),
							(reason: any) => resolve(false),
						);
					}
				});
		});
	}
}
