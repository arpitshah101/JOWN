import * as mongoose from "mongoose";
import * as State from "./State";
import * as Form from "./Form";

let Schema = mongoose.Schema;

let workflowSchema = new Schema({

    workflowId: {
        type: Number,
        required: true,
        unique: true
    },

    workflowName: {
        type: String,
        required: true
    },

    owner: {
        type: [User], // Or userIds?
        required: true
    },

    created: {
        type: Date,
        required: true,
        default: Date.now
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


export interface Workflow {
    workflowId: Number;
    workflowName: String;
    owner: [User];
    created: Date;
    stateList: State.State[];
    formList: Form.Form[];
};

export interface Document extends mongoose.Document, Workflow { };

export let model = mongoose.model<Document>("Workflow", workflowSchema);