import * as mongoose from "mongoose";
import * as User from "./User";

let Schema = mongoose.Schema;

let formSchema = new Schema({

    workflowId: {
        type: Number,
        required: true // Or handled by mongoDB?
    },

    formName: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    editor: {
        type: [User],
        required: true
    },

    savedAt: {
        type: Date,
        required: true,
        default: Date.now // Assuming "now" is at creation of the instance

}, { versionKey: false }); // VSC tells me "property assignment expected"


export interface Form {
    formName: String;
    status: String;
    edit: [User]; // VSC tells me "cant find name User" but user is imported at top. What gives?
    savedAt: Date;
};

export interface Document extends mongoose.Document, Form { };

export let model = mongoose.model<Document>("Form", formSchema);