import * as mongoose from 'mongoose';

import * as Data from '../models/Data';

export class DataManager {
    
    saveData(instanceId: String, formName: String, dataObj: Object): boolean {
        
        let saveDataQuery = Data.model.findOne({instanceId: instanceId, formName: formName});

        if (saveDataQuery == null)
            return false;

        else {
            let data = this.getData(instanceId, formName);
            data = dataObj;
            return true;
        }
        
    }

    getData(instanceId: String, formName?: String): Object {
        
        let getDataQuery = Data.model.findOne({instanceId: instanceId, formName: formName});

        if (getDataQuery != null) {
            getDataQuery.exec(function(err: any, res: Data.Document) {
                return res.data;
            });
        }

        else
            return null;
        
    }

}