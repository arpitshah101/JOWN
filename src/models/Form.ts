import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let formSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    }

}, {versionType: false});

export interface Form {
    name: String,
    status: String
}

export interface Document extends mongoose.Document, Form { }

export var model = mongoose.model<Document>('Form', formSchema);