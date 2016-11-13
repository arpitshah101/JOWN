import * as mongoose from 'mongoose';
import * as State from './State';
import * as Form from './Form';

let Schema = mongoose.Schema;

let workflowSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    workflowId: {
        type: Number,
        required: true
    },

    stateList: {
        type: [Schema.Types.ObjectId],
        required: true
    },

    formList: {
        type: [Schema.Types.ObjectId],
        required: true
    }

}, {versionKey: false});

interface Workflow {
    name: String,
    workflowId: number,
    stateList: State.State[],
    formList: Form.Form[]
}

export interface Document extends mongoose.Document, Workflow { }

var model = mongoose.model<Document>('Workflow', workflowSchema);