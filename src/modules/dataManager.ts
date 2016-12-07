// promise-bluebird.d.ts
import * as Bluebird from "bluebird";

declare module "mongoose" {
	type Promise<T> = Bluebird<T>;
}
import * as Data from "../models/Data";

import * as mongoose from "mongoose";

export class DataManager {

	public saveData(instanceId: string, formName: string, dataObj: Object): Bluebird<boolean> {
		// if so, update & save
		//      return true
		// else save new doc
		//      return true

		// query to check if doc exists for <instanceId, formName?>
		let overallPromise = this.getData(instanceId, formName)
			.then((doc: Data.IDocument) => {
				if (doc) {
					doc.data = dataObj;
					return doc.save()
						.then((doc: Data.IDocument) => true, (reason: any) => false);
				}
				else {
					let newData = new Data.model({
						data: dataObj,
						formName,
						instanceId,
					});
					return newData.save()
						.then((doc: Data.IDocument) => true, (reason: any) => false);
				}
			});
		return overallPromise;
	}

	public getData(instanceId: String, formName?: String): Bluebird<Data.IDocument> {
		let query = Data.model.findOne({ instanceId, formName }).exec();
		return query.then((doc: Data.IDocument) => {
			return Bluebird.resolve(doc);
		});
	}
}
