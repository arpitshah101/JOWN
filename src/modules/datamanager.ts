// promise-bluebird.d.ts
import * as Bluebird from 'bluebird';

declare module 'mongoose' {
  type Promise<T> = Bluebird<T>;
}
import * as mongoose from 'mongoose';

import * as Data from '../models/Data';

export class DataManager {

    getData(instanceId: String, formName?: String): Bluebird<Data.Document> {
        let query = Data.model.findOne({ instanceId: instanceId, formName: formName }).exec();
        return query.then((doc: Data.Document) => {
            return Bluebird.resolve(doc);
        });
    }

    saveData(instanceId: string, formName: string, dataObj: Object): Bluebird<boolean> {
        // if so, update & save
        //      return true
        // else save new doc
        //      return true

        // query to check if doc exists for <instanceId, formName?>
        let overallPromise = this.getData(instanceId, formName)
            .then((doc: Data.Document) => {
                if (doc) {
                    doc.data = dataObj;
                    return doc.save()
                        .then(
                            (doc: Data.Document) => true,
                            (reason: any) => false,
                        );
                }
                else {
                    let newData = new Data.model({
                        data: dataObj,
                        formName: formName,
                        instanceId: instanceId
                    });
                    return newData.save()
                        .then(
                            (doc: Data.Document) => true,
                            (reason: any) => false
                        );
                }
            })
        return overallPromise;
    }
}