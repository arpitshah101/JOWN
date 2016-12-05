import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let userSchema = new Schema({

    userName: {
        type: String,
        required: true
    },

    userEmail: {
        type: String,
        required: true,
        unique: true
    },

    userId: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    roles: {
        type: [String],
        required: true
    },

    created: {
        type: Date,
        default: new Date(Date.now()),
        required: true
    },

    workflowInstances: {
        type: [Number]
    }

}, {skipVersioning: false});


export interface User {
    userName: String;
    userEmail: String;
    userId: String;
    password: String;
    roles: String[];
    created: Date;
    workflowInstances: [Object];
};

export interface Document extends mongoose.Document, User { };

export let model = mongoose.model<Document>("User", userSchema);