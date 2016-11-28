import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let dataSchema = new Schema({
    data: {
        type: {},
        required: true,
        default: {}
    },
    formName: {
        type: String,
        default: null
    },
    instanceId: {
        type: String,
        required: true
    },
}, { skipVersioning: true });

export interface Data {
    data: any,
    formName: string,
    instanceId: string,
}

export interface Document extends mongoose.Document, Data { }

export var model = mongoose.model<Document>('Data', dataSchema);