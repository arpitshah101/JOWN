import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let dataSchema = new Schema({

    instanceId: {
        type: String,
        required: true
    },
    formName: {
        type: String,
        default: null
    },
    data: {
        type: {},
        required: true,
        default: {}
    }
}, {versionType: false});

export interface Data {
    instanceId: string,
    formName: string,
    data: any
}

export interface Document extends mongoose.Document, Data { }

export var model = mongoose.model<Document>('Data', dataSchema);