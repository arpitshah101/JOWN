// promise-bluebird.d.ts
import * as Bluebird from "bluebird";

/*declare module "mongoose" {
	type Promise<T> = Bluebird<T>;
}*/
import * as mongoose from "mongoose";

import * as Data from "../models/Data";

export class DataManager {

	public getData(instanceId: String, formName?: String): Bluebird<Data.Document> {
		return new Bluebird<Data.Document>((resolve, reject) => {
			Data.model.findOne({instanceId, formName}).exec().
				then((doc: Data.Document) => {
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
				then((doc: Data.Document) => {
					if (doc) {
						doc.data = dataObj;
						doc.save().then(
							(docmt: Data.Document) => resolve(true),
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
							(docmt: Data.Document) => resolve(true),
							(reason: any) => resolve(false),
						);
					}
				});
		});
	}
}
