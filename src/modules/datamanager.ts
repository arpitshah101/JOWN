import * as mongoose from 'mongoose';

import * as Data from '../models/Data';

export class DataManager {
    
    saveData(dataObj: Object): boolean {
        // TEMP RETURN. MAKE SURE TO RETURN ACTUAL RESULT
        // Data.model.create({
        //    instanceId: "",

        // });
        return null;
    }

    getData(instanceId: String, formName?: String): any {
        let query = Data.model.findOne({instanceId: instanceId, formName: formName});
        query.exec(function(err: any, res: Data.Document) {
            return res.data;
        });
    }

}